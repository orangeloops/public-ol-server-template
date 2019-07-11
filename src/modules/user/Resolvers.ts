import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {IUserProvider, USER_PROVIDER_CLASS} from "./Helper";

export default ({injector}: GraphQLModule) => {
  const provider = injector.get<IUserProvider>(USER_PROVIDER_CLASS);

  return {
    Query: {
      me: async (parent: any, args: any, context: IServerContext) => provider.me(context),

      user: async (parent: any, {id}: any, context: IServerContext) => provider.user(id, context),
    },
    UserStatus: {
      PENDING: 0,
      ACTIVE: 1,
      BLOCKED: -1,
    },
    Mutation: {
      updateUser: async (parent: any, {id, name, upload}: any, context: IServerContext) => provider.updateUser(id, name, upload, context),
      deleteUser: async (parent: any, {id, upload}: any, context: IServerContext) => provider.deleteUser(id, context),
    },
  };
};
