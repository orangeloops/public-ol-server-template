import {Injectable} from "@graphql-modules/di";
import {ServerContext} from "../common/Models";
import APIHelper, {APIProviderType} from "./Helper";
import {sequelize} from "../../db/models/Index";

@Injectable()
export default class APIProvider implements APIProviderType {
  constructor() {}

  version(context: ServerContext): string {
    return APIHelper.getVersion();
  }

  reset(context: ServerContext): void {
    sequelize.sync({force: true});
  }
}
