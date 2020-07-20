import {GraphQLModule} from "@graphql-modules/core";
import {ServerContext} from "../common/Models";
import {AUTHENTICATION_PROVIDER_CLASS, AuthenticationProviderType} from "./Helper";
import {Resolvers} from "../Resolvers.types";

export default ({injector}: GraphQLModule): Resolvers => {
  const provider = injector.get<AuthenticationProviderType>(AUTHENTICATION_PROVIDER_CLASS);

  return {
    Mutation: {
      signUp: async (parent, {name, email, password, upload}, context: ServerContext) => provider.signUp(name, email, password, upload, context),
      signIn: async (parent, {email, password, generateRefreshToken}, context: ServerContext) => provider.signIn(email, password, generateRefreshToken, context),
      refreshTokens: async (parent, {token}, context: ServerContext) => provider.refreshTokens(token, context),
      checkEmail: async (parent, {email}, context: ServerContext) => provider.checkEmail(email, context),
      confirmEmail: async (parent, {token}, context: ServerContext) => {
        await provider.confirmEmail(token, context);

        return {};
      },
      resendEmailConfirmation: async (parent, {email}, context: ServerContext) => provider.resendEmailConfirmation(email, context),
      requestResetPassword: async (parent, {email}, context: ServerContext) => provider.requestResetPassword(email, context),
      resetPassword: async (parent, {token, password}, context: ServerContext) => provider.resetPassword(token, password, context),
    },
  };
};
