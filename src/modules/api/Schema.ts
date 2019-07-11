import {gql} from "apollo-server-express";

export default gql`
  type Query {
    version: String
    reset: String
  }
`;
