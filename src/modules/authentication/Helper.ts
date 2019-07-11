import * as _ from "lodash";
import * as express from "express";
import {AuthenticationError} from "apollo-server-express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {VerifyErrors} from "jsonwebtoken";
import {ModuleSessionInfo} from "@graphql-modules/core";
import {getFieldsWithDirectives} from "@graphql-modules/utils";
import {NextResolverFunction, throwInvalidMeError} from "../common/Helper";
import {IServerContext, IUserRef} from "../common/Models";
import User from "../../db/models/User";

export const AUTHENTICATION_PROVIDER_CLASS = "AUTHENTICATION_PROVIDER_CLASS";

export const isAuthenticated = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {models, currentUser} = context;

  let user: User;

  if (!_.isNil(currentUser)) user = await models.User.findByPk(currentUser.id);

  if (_.isNil(user)) throwInvalidMeError();

  return next(parent, args, context, info);
};

const DIRECTIVE_TO_GUARD: any = {
  isAuthenticated: () => isAuthenticated,
};

export const resolversComposition = ({typeDefs}: any) => {
  const result: any = {};
  const fieldsAndTypeToDirectivesMap = getFieldsWithDirectives(typeDefs);

  for (const fieldPath in fieldsAndTypeToDirectivesMap) {
    const directives = fieldsAndTypeToDirectivesMap[fieldPath];

    if (directives.length > 0) {
      result[fieldPath] = directives
        .map((directive: any) => {
          if (DIRECTIVE_TO_GUARD[directive.name]) {
            const mapperFn = DIRECTIVE_TO_GUARD[directive.name];

            return mapperFn(directive.args);
          }

          return null;
        })
        .filter((a: any) => a);
    }
  }

  return result;
};

export interface IAuthenticationModuleConfig {
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRATION: string;
  MAILJET_APIKEY_PUBLIC: string;
  MAILJET_APIKEY_PRIVATE: string;
  MAILJET_CAMPAIGN: string;
  MAILJET_FROM: string;
  MAILJET_FROM_NAME: string;
  MAILJET_ACTIVATION_TEMPLATE_ID: string;
  MAILJET_ACTIVATION_LINK: string;
  MAILJET_PASSWORD_TEMPLATE_ID: string;
  MAILJET_PASSWORD_LINK: string;
}

export interface IAuthenticationModuleRequest {
  req: express.Request;
}

export interface IAuthenticationProvider {
  context: (request: IAuthenticationModuleRequest, currentContext: IServerContext, sessionInfo: ModuleSessionInfo<IAuthenticationModuleConfig, IAuthenticationModuleRequest, IServerContext>) => Promise<any>;
  signUp: (name: string, email: string, password: string, upload: any, context: IServerContext) => Promise<any>;
  signIn: (email: string, password: string, generateRefreshToken: boolean, context: IServerContext) => Promise<any>;
  refreshTokens: (token: string, context: IServerContext) => Promise<any>;
  checkEmail: (email: string, context: IServerContext) => Promise<any>;
  confirmEmail: (token: string, context: IServerContext) => Promise<User>;
  resendEmailConfirmation: (email: string, context: IServerContext) => Promise<any>;
  requestResetPassword: (email: string, context: IServerContext) => Promise<any>;
  resetPassword: (token: string, password: string, context: IServerContext) => Promise<any>;
}

export default class AuthenticationHelper {
  static refFromUser(user: User): IUserRef {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    };
  }

  static async createToken(data: any, secretOrPublicKey: string, expiresIn: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(data, secretOrPublicKey, {expiresIn}, (error: Error, encoded: string) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(encoded);
      });
    });
  }

  static async verifyToken(token: string, secretOrPublicKey: string): Promise<object | string> {
    return new Promise<object | string>((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, (errors: VerifyErrors, decoded: object | string) => {
        if (errors) {
          reject(errors);
          return;
        }

        resolve(decoded);
      });
    });
  }

  static async verifyTokenFromRequest(request: IAuthenticationModuleRequest, secretOrPublicKey: string, currentContext: IServerContext): Promise<any> {
    const token = request.req.headers["x-token"];

    try {
      if (_.isString(token) && token.length > 0) return await AuthenticationHelper.verifyToken(token, secretOrPublicKey);
    } catch (e) {
      throw new AuthenticationError("Invalid authentication token");
    }
  }

  static async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async validatePassword(value: string, password: string): Promise<boolean> {
    return await bcrypt.compare(value, password);
  }
}
