import * as dotenv from "dotenv";

dotenv.config({path: `.env.${process.env.NODE_ENV}`});
dotenv.config();

export const PORT = process.env.PORT;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_NAME = process.env.DB_NAME;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;

export const GOOGLE_STORAGE_ROOT = process.env.GOOGLE_STORAGE_ROOT;
export const GOOGLE_STORAGE_BUCKET = process.env.GOOGLE_STORAGE_BUCKET;

export const MAILJET_APIKEY_PUBLIC = process.env.MAILJET_APIKEY_PUBLIC;
export const MAILJET_APIKEY_PRIVATE = process.env.MAILJET_APIKEY_PRIVATE;
export const MAILJET_CAMPAIGN = process.env.MAILJET_CAMPAIGN;
export const MAILJET_FROM = process.env.MAILJET_FROM;
export const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME;
export const MAILJET_ACTIVATION_TEMPLATE_ID = process.env.MAILJET_ACTIVATION_TEMPLATE_ID;
export const MAILJET_ACTIVATION_LINK = process.env.MAILJET_ACTIVATION_LINK;
export const MAILJET_PASSWORD_TEMPLATE_ID = process.env.MAILJET_PASSWORD_TEMPLATE_ID;
export const MAILJET_PASSWORD_LINK = process.env.MAILJET_PASSWORD_LINK;
