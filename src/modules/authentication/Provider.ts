import * as _ from "lodash";
import {Storage} from "@google-cloud/storage";
import {AuthenticationError, UserInputError} from "apollo-server-express";
import {ModuleConfig} from "@graphql-modules/core";
import {ModuleSessionInfo} from "@graphql-modules/core";
import {Inject, Injectable} from "@graphql-modules/di";
import dbModels from "../../db/models";
import User, {IRefreshToken, UserStatus} from "../../db/models/User";
import CommonHelper from "../common/Helper";
import AuthenticationHelper, {IAuthenticationModuleConfig, IAuthenticationModuleRequest, IAuthenticationProvider} from "./Helper";
import {FileOwnerType, FileType, IServerContext} from "../common/Models";

const cloudStorage = new Storage();

@Injectable()
export default class AuthenticationProvider implements IAuthenticationProvider {
  constructor(@Inject(ModuleConfig("AuthenticationModule")) private config: IAuthenticationModuleConfig) {}

  async context(request: IAuthenticationModuleRequest, currentContext: IServerContext, sessionInfo: ModuleSessionInfo<IAuthenticationModuleConfig, IAuthenticationModuleRequest, IServerContext>): Promise<IServerContext> {
    const tokenPayload = await AuthenticationHelper.verifyTokenFromRequest(request, sessionInfo.module.config.ACCESS_TOKEN_SECRET, currentContext);

    return {
      storage: cloudStorage,
      models: dbModels,
      currentUser: !_.isNil(tokenPayload) ? tokenPayload.user : undefined,
    } as IServerContext;
  }

  async signUp(name: string, email: string, password: string, upload: any, {storage, models}: IServerContext) {
    const errorMessage = "Email already in use";

    email = email.trim().toLowerCase();

    let user = await models.User.findOne({where: {email: email}});

    if (!_.isNil(user)) throw new UserInputError(errorMessage, {statusCode: 409});

    const objectId: string = CommonHelper.getUUID(false);
    let imageUrl: string = undefined;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.User, objectId, upload, {
        _ownerId: objectId,
        _ownerType: FileOwnerType.User,
        _fileType: FileType.Image,
      });

      imageUrl = uploadResponse.publicUrl;
    }

    const code = CommonHelper.getUUID();

    user = await models.User.create({
      id: objectId,
      name: name,
      email: email,
      password: password,
      imageUrl: imageUrl,

      status: UserStatus.Pending,
      customData: {
        activation: {
          code: code,
          codeDate: new Date(),
        },
      },
    });

    return await this.sendEmailConfirmation(user.id, user.name, email, code).catch(error => console.log(error));
  }

  async signIn(email: string, password: string, generateRefreshToken: boolean, {models}: IServerContext) {
    const errorMessage = "You have entered an invalid username or password";

    email = email.trim().toLowerCase();

    const user = await models.User.findOne({where: {email: email}});

    if (_.isNil(user)) throw new AuthenticationError(errorMessage);

    const isValid = await AuthenticationHelper.validatePassword(password, user.password);

    if (!isValid) throw new AuthenticationError(errorMessage);

    if (user.status !== UserStatus.Active) {
      let statusMessage;

      switch (user.status) {
        case UserStatus.Pending:
          statusMessage = "User should confirm email";
          break;
        case UserStatus.Blocked:
          statusMessage = "User blocked";
          break;
        default:
          statusMessage = errorMessage;
      }

      throw new UserInputError(statusMessage, {statusCode: 409});
    }

    const userRef = AuthenticationHelper.refFromUser(user);

    const accessToken = await AuthenticationHelper.createToken({user: userRef}, this.config.ACCESS_TOKEN_SECRET, this.config.ACCESS_TOKEN_EXPIRATION);
    let refreshToken: string = undefined;

    if (generateRefreshToken) {
      refreshToken = await AuthenticationHelper.createToken({user: userRef}, this.config.REFRESH_TOKEN_SECRET, this.config.REFRESH_TOKEN_EXPIRATION);

      const refreshTokens = user.refreshTokens || [];
      refreshTokens.push({token: refreshToken, enabled: true});

      await user.update({
        refreshTokens: refreshTokens,
      });
    }

    return {token: accessToken, refreshToken: refreshToken};
  }

  async refreshTokens(token: string, {models}: IServerContext) {
    const errorMessage = "Invalid user or token";

    const tokenPayload: any = await AuthenticationHelper.verifyToken(token, this.config.REFRESH_TOKEN_SECRET);

    if (
      _.isNil(tokenPayload) ||
      _.isNil(tokenPayload.user) ||
      _.isNil(tokenPayload.user.id) ||
      !_.isString(tokenPayload.user.id) ||
      _.isEmpty(tokenPayload.user.id) ||
      _.isNil(tokenPayload.user.email) ||
      !_.isString(tokenPayload.user.email) ||
      _.isEmpty(tokenPayload.user.email)
    )
      throw new UserInputError(errorMessage);

    tokenPayload.user.email = tokenPayload.user.email.trim().toLowerCase();

    const user = await models.User.findOne({where: {id: tokenPayload.user.id, email: tokenPayload.user.email}});

    if (_.isNil(user)) throw new UserInputError(errorMessage);

    if (user.status !== UserStatus.Active) throw new UserInputError(errorMessage);

    let refreshTokens = user.refreshTokens || [];

    const savedRefreshToken: IRefreshToken = refreshTokens.find((r: IRefreshToken) => r.token === token);

    if (_.isNil(savedRefreshToken) || !savedRefreshToken!.enabled) throw new UserInputError(errorMessage);

    const userRef = AuthenticationHelper.refFromUser(user);

    const accessToken = await AuthenticationHelper.createToken({user: userRef}, this.config.ACCESS_TOKEN_SECRET, this.config.ACCESS_TOKEN_EXPIRATION);
    const refreshToken: string = await AuthenticationHelper.createToken({user: userRef}, this.config.REFRESH_TOKEN_SECRET, this.config.REFRESH_TOKEN_EXPIRATION);

    refreshTokens = refreshTokens.filter((r: IRefreshToken) => r.token !== token);
    refreshTokens.push({token: refreshToken, enabled: true});

    await user.update({
      refreshTokens: refreshTokens,
    });

    return {token: accessToken, refreshToken: refreshToken};
  }

  async checkEmail(email: string, {models}: IServerContext) {
    email = email.trim().toLowerCase();

    const user = await models.User.findOne({where: {email: email}});

    const isAvailable = _.isNil(user);

    return {
      isAvailable: isAvailable,
      isBlacklisted: false,
      isCorporate: false,
    };
  }

  async resendEmailConfirmation(email: string, {models}: IServerContext) {
    email = email.trim().toLowerCase();

    const user = await models.User.findOne({where: {email: email}});

    if (_.isNil(user)) return;

    if (user.status !== UserStatus.Pending) return;

    const code = CommonHelper.getUUID();

    await user.update({
      customData: {
        activation: {
          code: code,
          codeDate: new Date(),
        },
      },
    });

    await this.sendEmailConfirmation(user.id, user.name, email, code).catch(error => console.log(error));
  }

  async sendMessage(userId: string, name: string, email: string, subject?: string, templateId?: string, variables?: any): Promise<any> {
    email = email.trim().toLowerCase();

    const mailjet = require("node-mailjet").connect(this.config.MAILJET_APIKEY_PUBLIC, this.config.MAILJET_APIKEY_PRIVATE);

    let message: any = {
      CustomCampaign: this.config.MAILJET_CAMPAIGN,

      From: {
        Email: this.config.MAILJET_FROM,
        Name: this.config.MAILJET_FROM_NAME,
      },

      To: [
        {
          Email: email,
          Name: name,
        },
      ],
    };

    if (!_.isNil(templateId)) {
      message.TemplateID = parseInt(templateId, 10);
      message.TemplateLanguage = true;

      message.TemplateErrorDeliver = true;
      message.TemplateErrorReporting = {
        Email: this.config.MAILJET_FROM,
        Name: this.config.MAILJET_FROM_NAME,
      };
    }

    if (!_.isNil(variables)) {
      message.Variables = variables;
    }

    return mailjet.post("send", {version: "v3.1"}).request({Messages: [message]});
  }

  async sendEmailConfirmation(userId: string, name: string, email: string, code: string): Promise<any> {
    email = email.trim().toLowerCase();

    const token = await AuthenticationHelper.createToken({user: {id: userId, email: email, code: code}}, this.config.ACCESS_TOKEN_SECRET, this.config.ACCESS_TOKEN_EXPIRATION);

    const link = this.config.MAILJET_ACTIVATION_LINK.replace("{token}", token);
    console.log(link);

    return this.sendMessage(userId, name, email, undefined, this.config.MAILJET_ACTIVATION_TEMPLATE_ID, {
      name: name,
      link: link,
    });
  }

  async confirmEmail(token: string, {models}: IServerContext): Promise<User> {
    const errorMessage = "Invalid email or confirmation code";

    const tokenPayload: any = await AuthenticationHelper.verifyToken(token, this.config.ACCESS_TOKEN_SECRET);

    if (
      _.isNil(tokenPayload) ||
      _.isNil(tokenPayload.user) ||
      _.isNil(tokenPayload.user.id) ||
      !_.isString(tokenPayload.user.id) ||
      _.isEmpty(tokenPayload.user.id) ||
      _.isNil(tokenPayload.user.email) ||
      !_.isString(tokenPayload.user.email) ||
      _.isEmpty(tokenPayload.user.email) ||
      _.isNil(tokenPayload.user.code) ||
      !_.isString(tokenPayload.user.code) ||
      _.isEmpty(tokenPayload.user.code)
    )
      throw new UserInputError(errorMessage);

    tokenPayload.user.email = tokenPayload.user.email.trim().toLowerCase();

    const user = await models.User.findOne({where: {id: tokenPayload.user.id, email: tokenPayload.user.email}});

    if (_.isNil(user)) throw new UserInputError(errorMessage);

    if (_.isNil(user.customData.activation) || user.customData.activation.code !== tokenPayload.user.code) throw new UserInputError(errorMessage);

    const customData = user.customData;
    delete customData.activation;

    return await user.update({
      status: UserStatus.Active,
      customData: customData,
    });
  }

  async requestResetPassword(email: string, {models}: IServerContext): Promise<any> {
    const errorMessage = "Invalid email or confirmation code";

    email = email.trim().toLowerCase();

    let user = await models.User.findOne({where: {email: email}});

    if (_.isNil(user)) throw new UserInputError(errorMessage);

    const code = CommonHelper.getUUID();

    await user.update({
      customData: {
        ...user.customData,
        resetPassword: {
          code: code,
          codeDate: new Date(),
        },
      },
    });

    const token = await AuthenticationHelper.createToken({user: {email: email, code: code}}, this.config.ACCESS_TOKEN_SECRET, this.config.ACCESS_TOKEN_EXPIRATION);

    const link = this.config.MAILJET_PASSWORD_LINK.replace("{token}", token);
    console.log(link);

    return this.sendMessage(user.id, user.name, user.email, undefined, this.config.MAILJET_PASSWORD_TEMPLATE_ID, {
      name: user.name,
      link: link,
    });
  }

  async resetPassword(token: string, password: string, {models}: IServerContext): Promise<User> {
    const errorMessage = "Invalid email or confirmation code";

    const tokenPayload: any = await AuthenticationHelper.verifyToken(token, this.config.ACCESS_TOKEN_SECRET);

    if (
      _.isNil(tokenPayload) ||
      _.isNil(tokenPayload.user) ||
      _.isNil(tokenPayload.user.email) ||
      !_.isString(tokenPayload.user.email) ||
      _.isEmpty(tokenPayload.user.email) ||
      _.isNil(tokenPayload.user.code) ||
      !_.isString(tokenPayload.user.code) ||
      _.isEmpty(tokenPayload.user.code)
    )
      throw new UserInputError(errorMessage);

    tokenPayload.user.email = tokenPayload.user.email.trim().toLowerCase();

    const user = await models.User.findOne({where: {email: tokenPayload.user.email}});

    if (_.isNil(user)) throw new UserInputError(errorMessage);

    if (_.isNil(user.customData.resetPassword) || user.customData.resetPassword.code !== tokenPayload.user.code) throw new UserInputError(errorMessage);

    const customData = user.customData;
    delete customData.resetPassword;

    password = await AuthenticationHelper.generatePasswordHash(password);

    return await user.update({
      password: password,
      customData: customData,
    });
  }
}
