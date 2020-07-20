import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {API_PROVIDER_CLASS, isStagingOrDevelopment} from "./Helper";
import APIProvider from "./Provider";
import {CommonModule} from "../common/Index";
import {AuthenticationModule} from "../authentication/Index";

export const APIModule = new GraphQLModule({
  name: "APIModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule],
  providers: [{provide: API_PROVIDER_CLASS, useClass: APIProvider}],
  resolversComposition: {
    "Query.reset": [isStagingOrDevelopment()],
  },
});
