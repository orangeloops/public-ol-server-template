import {GraphQLModule} from "@graphql-modules/core";
import {GraphQLDateTime} from "graphql-iso-date";
import {ICommonProvider, COMMON_PROVIDER_CLASS} from "./Helper";
import {ConnectionOrderDirection} from "./Models";

export default ({injector}: GraphQLModule) => {
  const provider = injector.get<ICommonProvider>(COMMON_PROVIDER_CLASS);

  return {
    DateTime: GraphQLDateTime,
    ConnectionOrderDirection: {...ConnectionOrderDirection},
  };
};
