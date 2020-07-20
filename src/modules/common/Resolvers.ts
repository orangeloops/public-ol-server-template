import {GraphQLModule} from "@graphql-modules/core";
import {GraphQLDateTime} from "graphql-iso-date";
import {COMMON_PROVIDER_CLASS, CommonProviderType} from "./Helper";
import {Resolvers} from "../Resolvers.types";

export default ({injector}: GraphQLModule): Resolvers => {
  const provider = injector.get<CommonProviderType>(COMMON_PROVIDER_CLASS);

  return {
    DateTime: GraphQLDateTime,
  };
};
