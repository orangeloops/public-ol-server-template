import {gql} from "apollo-server-express";

export default gql`
  extend type Query {
    me: User
    user(id: ID!): User
  }

  extend type Mutation {
    updateUser(id: ID!, name: String, upload: Upload): User
    deleteUser(id: ID!): Boolean!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    status: UserStatus!
    imageUrl: String

    createdDate: DateTime!
    modifiedDate: DateTime!
    deletedDate: DateTime
  }

  enum UserStatus {
    PENDING
    ACTIVE
    BLOCKED
  }
`;
