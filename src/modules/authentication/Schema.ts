import {gql} from "apollo-server-express";

export default gql`
  type Mutation {
    signUp(name: String!, email: String!, password: String!, upload: Upload): Void
    signIn(email: String!, password: String!, generateRefreshToken: Boolean = false): Tokens
    refreshTokens(token: String!): Tokens
    checkEmail(email: String!): CheckEmail
    confirmEmail(token: String!): Void
    resendEmailConfirmation(email: String!): Void
    requestResetPassword(email: String!): Void
    resetPassword(token: String!, password: String!): Void
  }

  type CheckEmail {
    isAvailable: Boolean
    isBlacklisted: Boolean
    isCorporate: Boolean
  }

  type Tokens {
    token: String!
    refreshToken: String
  }
`;
