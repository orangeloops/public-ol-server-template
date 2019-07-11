import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {COMMON_PROVIDER_CLASS} from "./Helper";
import CommonProvider from "./Provider";

export const CommonModule = new GraphQLModule({
  name: "CommonModule",
  typeDefs,
  resolvers,
  providers: [{provide: COMMON_PROVIDER_CLASS, useClass: CommonProvider}],
});
