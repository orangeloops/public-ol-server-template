import {ModuleContext} from "@graphql-modules/core";
import {File, Storage} from "@google-cloud/storage";
import models from "../../db/models/Index";

export type ServerContext = ModuleContext<{
  storage: Storage;
  models: typeof models;
  currentUser?: UserRef;
}>;

export type UserRef = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};

// region Relay
export type Edge<T> = {
  node: T;
  cursor: string;
};

export type PageInfo = {
  endCursor?: string;
  hasNextPage: boolean;
};

export type RelayConnection<T> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
};

export const ConnectionOrderDirection = {
  ASC: "ASC",
  DESC: "DESC",
};
// endregion

// region File
export enum FileOwnerType {
  User = "user",
}

export enum FileType {
  Image = "image",
}

export type FileMetadata = {
  _ownerType?: FileOwnerType;
  _ownerId?: string;
  _fileType?: string;
};

export type UploadFileResponse = {
  file?: File;
  publicUrl?: string;
};

// endregion
