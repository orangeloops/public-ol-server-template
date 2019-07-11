import {ModuleContext} from "@graphql-modules/core";
import {File, Storage} from "@google-cloud/storage";

export type IServerContext = ModuleContext<{
  storage: Storage;
  models: any;
  currentUser?: IUserRef;
}>;

export interface IUserRef {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

// region Relay
export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IPageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

export interface IRelayConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

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

export interface IFileMetadata {
  _ownerType?: FileOwnerType;
  _ownerId?: string;
  _fileType?: string;
}

export interface IUploadFileResponse {
  file?: File;
  publicUrl?: string;
}

// endregion
