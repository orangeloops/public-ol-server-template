import {GraphQLModule} from "@graphql-modules/core";
import {UserProviderType, USER_PROVIDER_CLASS} from "./Helper";
import {Resolvers} from "../Resolvers.types";

export default ({injector}: GraphQLModule): Resolvers => {
  const provider = injector.get<UserProviderType>(USER_PROVIDER_CLASS);

  return {
    Query: {
      me: async (parent, args, context) => provider.me(context),

      user: async (parent, {id}, context) => provider.user(id, context),
    },
    ...{
      // TODO-SG: Wait for https://github.com/dotansimha/graphql-code-generator/issues/3444
      UserStatus: {
        PENDING: 0,
        ACTIVE: 1,
        BLOCKED: -1,
      },
    },
    Mutation: {
      updateUser: async (parent, {id, name, upload}, context) => provider.updateUser(id, name, upload, context),
      deleteUser: async (parent, {id}, context) => provider.deleteUser(id, context),
    },
  };
};
