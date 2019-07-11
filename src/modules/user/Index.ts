import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {isAuthenticated} from "../authentication/Helper";
import {USER_PROVIDER_CLASS} from "./Helper";
import UserProvider from "./Provider";
import {CommonModule} from "../common";
import {AuthenticationModule} from "../authentication";

export const UserModule = new GraphQLModule({
  name: "UserModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule],
  providers: [{provide: USER_PROVIDER_CLASS, useClass: UserProvider}],
  // TODO-DG: Review Typescript definition for resolversComposition
  resolversComposition: {
    "Query.me": [isAuthenticated()] as any,
    "Mutation.updateUser": [isAuthenticated()] as any,
    "Mutation.deleteUser": [isAuthenticated()] as any,
  },
});
