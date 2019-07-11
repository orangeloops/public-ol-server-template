import {Injectable} from "@graphql-modules/di";
import {IServerContext} from "../common/Models";
import APIHelper, {IAPIProvider} from "./Helper";
import {sequelize} from "../../db/models";

@Injectable()
export default class APIProvider implements IAPIProvider {
  constructor() {}

  version(context: IServerContext): string {
    return APIHelper.getVersion();
  }

  reset(context: IServerContext): void {
    sequelize.sync({force: true});
  }
}
