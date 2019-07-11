import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {IAPIProvider, API_PROVIDER_CLASS} from "./Helper";

export default ({injector}: GraphQLModule) => {
  const provider = injector.get<IAPIProvider>(API_PROVIDER_CLASS);

  return {
    Query: {
      version: async (parent: any, args: any, context: IServerContext) => provider.version(context),
      reset: async (parent: any, args: any, context: IServerContext) => provider.reset(context),
    },
  };
};
