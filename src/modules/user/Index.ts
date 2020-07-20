import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {isAuthenticated} from "../authentication/Helper";
import {USER_PROVIDER_CLASS} from "./Helper";
import UserProvider from "./Provider";
import {CommonModule} from "../common/Index";
import {AuthenticationModule} from "../authentication/Index";

export const UserModule = new GraphQLModule({
  name: "UserModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule],
  providers: [{provide: USER_PROVIDER_CLASS, useClass: UserProvider}],
  resolversComposition: {
    "Query.me": [isAuthenticated()],
    "Mutation.updateUser": [isAuthenticated()],
    "Mutation.deleteUser": [isAuthenticated()],
  },
});
