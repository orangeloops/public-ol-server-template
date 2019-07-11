import {ValidationError} from "apollo-server";
import {NextResolverFunction} from "../common/Helper";
import {IServerContext} from "../common/Models";

export const API_PROVIDER_CLASS = "API_PROVIDER_CLASS";

export const isStagingOrDevelopment = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  if (APIHelper.isStaging || APIHelper.isDevelopment) return next(parent, args, context, info);

  throw new ValidationError("Only available in staging/development environment");
};

export interface IAPIProvider {
  version: (context: IServerContext) => string;
  reset: (context: IServerContext) => void;
}

export default class APIHelper {
  static get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  static get isStaging(): boolean {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "";

    return projectId.indexOf("-staging") > 0;
  }

  static get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  static getVersion(): string {
    return `1.0.0${process.env.GAE_VERSION ? " (" + process.env.GAE_VERSION + ")" : ""}`;
  }
}
