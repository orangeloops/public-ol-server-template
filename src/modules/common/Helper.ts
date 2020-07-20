import * as _ from "lodash";
import * as uuid from "uuid";
import {ForbiddenError, UserInputError} from "apollo-server";
import {Storage} from "@google-cloud/storage";
import * as config from "../../Config";
import {FileOwnerType, FileMetadata, ServerContext, UploadFileResponse} from "./Models";

const base64 = require("base-x")("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

export type NextResolverFunction = (parent: any, args: any, context: ServerContext, info: any) => void;

export const COMMON_PROVIDER_CLASS = "COMMON_PROVIDER_CLASS";

export type CommonProviderType = {};

export const throwInvalidMeError = () => {
  throw new ForbiddenError("Not authenticated");
};

export const throwNotOwnerError = () => {
  throw new ForbiddenError("Operation not allowed");
};

export const throwNotImplementedError = (message?: string) => {
  throw new UserInputError("Not yet implemented" + (!_.isNil(message) ? ` (${message})` : ""));
};

export const throwInvalidDomainError = () => {
  throw new ForbiddenError("Operation not allowed");
};

export default class CommonHelper {
  static getCursorHash = (value: string): string => Buffer.from(value).toString("base64");

  static parseCursorHash = (hash: string): string => Buffer.from(hash, "base64").toString("ascii");

  static getUUID(short = true): string {
    if (short) {
      const buf = new Buffer(16);
      const uuidLong = uuid.v4(null, buf);

      let result = base64.encode(uuidLong);
      result = result.replace(/\//g, "_");
      result = result.replace(/\+/g, "-");
      result = result.replace(/=/g, "");

      return result;
    } else return uuid.v4();
  }

  static uploadFile(storage: Storage, ownerType: FileOwnerType, ownerId: string, upload: any, metadata?: FileMetadata): Promise<UploadFileResponse> {
    return new Promise<UploadFileResponse>(async (resolve, reject) => {
      const {stream: readStream, filename: uploadFilename, mimetype: uploadMimetype, encoding: uploadEncoding} = await upload;

      const bucket = await storage.bucket(config.GOOGLE_STORAGE_BUCKET);

      const fileExtension = uploadFilename.lastIndexOf(".") > 0 ? `.${uploadFilename.split(".").pop()}` : "";
      const filename = `${config.GOOGLE_STORAGE_ROOT}/${ownerType}/${ownerId}${fileExtension.toLowerCase()}`;

      const file = bucket.file(filename);

      const writeStream = file.createWriteStream({
        metadata: {
          metadata: {
            ...metadata,
            _filename: uploadFilename,
          },
          contentType: uploadMimetype,
          contentEncoding: uploadEncoding,
        },
      });

      writeStream.on("error", (error) => reject(error));

      writeStream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${file.bucket.name}/${file.name}`;
        resolve({file: file, publicUrl: publicUrl});
      });

      readStream.pipe(writeStream);
    });
  }

  static deleteFile(storage: Storage, ownerType: FileOwnerType, ownerId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const bucket = await storage.bucket(config.GOOGLE_STORAGE_BUCKET);

      const filename = `${config.GOOGLE_STORAGE_ROOT}/${ownerType}/${ownerId}`;
      const file = bucket.file(filename);

      file
        .delete()
        .then(() => resolve())
        .catch((error: any) => (error.code === 404 ? resolve() : reject(error)));
    });
  }
}
