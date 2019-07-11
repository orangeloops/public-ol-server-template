import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {AUTHENTICATION_PROVIDER_CLASS, IAuthenticationProvider} from "./Helper";

export default ({injector}: GraphQLModule) => {
  const provider = injector.get<IAuthenticationProvider>(AUTHENTICATION_PROVIDER_CLASS);

  return {
    Mutation: {
      signUp: async (parent: any, {name, email, password, upload}: any, context: IServerContext) => provider.signUp(name, email, password, upload, context),
      signIn: async (parent: any, {email, password, generateRefreshToken}: any, context: IServerContext) => provider.signIn(email, password, generateRefreshToken, context),
      refreshTokens: async (parent: any, {token}: any, context: IServerContext) => provider.refreshTokens(token, context),
      checkEmail: async (parent: any, {email}: any, context: IServerContext) => provider.checkEmail(email, context),
      confirmEmail: async (parent: any, {token}: any, context: IServerContext) => provider.confirmEmail(token, context),
      resendEmailConfirmation: async (parent: any, {email}: any, context: IServerContext) => provider.resendEmailConfirmation(email, context),
      requestResetPassword: async (parent: any, {email}: any, context: IServerContext) => provider.requestResetPassword(email, context),
      resetPassword: async (parent: any, {token, password}: any, context: IServerContext) => provider.resetPassword(token, password, context),
    },
  };
};
