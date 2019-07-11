import {gql} from "apollo-server-express";

// directive @isAuthenticated on FIELD_DEFINITION
// directive @isChallengeOwner on FIELD_DEFINITION
// directive @isIdeaOwner on FIELD_DEFINITION
// directive @isReactionOwner on FIELD_DEFINITION

export default gql`
  scalar DateTime

  scalar Upload

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }

  type Void {
    _: Boolean
  }

  type ConnectionPageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  enum ConnectionOrderDirection {
    ASC
    DESC
  }
`;
