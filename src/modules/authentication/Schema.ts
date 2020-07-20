import {gql} from "apollo-server-express";

export default gql`
  extend type Mutation {
    signUp(name: String!, email: String!, password: String!, upload: Upload): Void
    signIn(email: String!, password: String!, generateRefreshToken: Boolean = false): AccessToken
    refreshTokens(token: String!): AccessToken
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

  type AccessToken {
    token: String!
    refreshToken: String
    expiresAt: DateTime
  }
`;
