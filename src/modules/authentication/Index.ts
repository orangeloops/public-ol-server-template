import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import * as config from "../../Config";
import {CommonModule} from "../common";
import {IServerContext} from "../common/Models";
import {AUTHENTICATION_PROVIDER_CLASS, IAuthenticationModuleConfig, IAuthenticationModuleRequest, IAuthenticationProvider} from "./Helper";
import AuthenticationProvider from "./Provider";

export const AuthenticationModule = new GraphQLModule<IAuthenticationModuleConfig, IAuthenticationModuleRequest, IServerContext>({
  name: "AuthenticationModule",
  typeDefs,
  resolvers,
  imports: [CommonModule],
  providers: [{provide: AUTHENTICATION_PROVIDER_CLASS, useClass: AuthenticationProvider}],
  context: async (request, currentContext, sessionInfo) => {
    const provider = sessionInfo.injector.get<IAuthenticationProvider>(AUTHENTICATION_PROVIDER_CLASS);

    return provider.context(request, currentContext, sessionInfo);
  },
}).forRoot({
  ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION: config.ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET: config.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION: config.REFRESH_TOKEN_EXPIRATION,

  MAILJET_APIKEY_PUBLIC: config.MAILJET_APIKEY_PUBLIC,
  MAILJET_APIKEY_PRIVATE: config.MAILJET_APIKEY_PRIVATE,
  MAILJET_CAMPAIGN: config.MAILJET_CAMPAIGN,
  MAILJET_FROM: config.MAILJET_FROM,
  MAILJET_FROM_NAME: config.MAILJET_FROM_NAME,

  MAILJET_ACTIVATION_TEMPLATE_ID: config.MAILJET_ACTIVATION_TEMPLATE_ID,
  MAILJET_ACTIVATION_LINK: config.MAILJET_ACTIVATION_LINK,

  MAILJET_PASSWORD_TEMPLATE_ID: config.MAILJET_PASSWORD_TEMPLATE_ID,
  MAILJET_PASSWORD_LINK: config.MAILJET_PASSWORD_LINK,
});
