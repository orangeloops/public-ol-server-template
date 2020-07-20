import {ServerContext} from "../common/Models";
import User from "../../db/models/User";

export const USER_PROVIDER_CLASS = "USER_PROVIDER_CLASS";

export type UserProviderType = {
  me: (context: ServerContext) => Promise<User>;
  user: (id: string, context: ServerContext) => Promise<User>;
  updateUser: (id: string, name: string, upload: any, context: ServerContext) => Promise<User>;
  deleteUser: (id: string, context: ServerContext) => Promise<boolean>;
};

export default class UserHelper {}
