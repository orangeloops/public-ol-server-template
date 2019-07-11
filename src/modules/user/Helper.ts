import {IServerContext} from "../common/Models";
import User from "../../db/models/User";

export const USER_PROVIDER_CLASS = "USER_PROVIDER_CLASS";

export interface IUserProvider {
  me: (context: IServerContext) => Promise<User>;
  user: (id: string, context: IServerContext) => Promise<User>;
  updateUser: (id: string, name: string, upload: any, context: IServerContext) => Promise<User>;
  deleteUser: (id: string, context: IServerContext) => Promise<User>;
}

export default class UserHelper {}
