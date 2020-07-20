import {GraphQLModule} from "@graphql-modules/core";
import {ServerContext} from "../common/Models";
import {APIProviderType, API_PROVIDER_CLASS} from "./Helper";
import {Resolvers} from "../Resolvers.types";

export default ({injector}: GraphQLModule): Resolvers => {
  const provider = injector.get<APIProviderType>(API_PROVIDER_CLASS);

  return {
    Query: {
      version: async (parent, args, context: ServerContext) => provider.version(context),
      reset: async (parent, args, context: ServerContext) => {
        provider.reset(context);
        return null;
      },
    },
  };
};
