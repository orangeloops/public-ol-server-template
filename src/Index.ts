import "reflect-metadata";
import * as winston from "winston";
import {LoggingWinston} from "@google-cloud/logging-winston";
import {useContainer} from "routing-controllers";
import {Container} from "typedi";
import {Server} from "./Server";

const isProduction = process.env.NODE_ENV === "production";

const winstonConsole = new winston.transports.Console();
const winstonGoogleCloud = isProduction ? new LoggingWinston() : undefined;

winston.configure({
  level: "info",
  format: winston.format.simple(),
  transports: winstonGoogleCloud ? [winstonConsole, winstonGoogleCloud] : [winstonConsole],
});

useContainer(Container);

const server = new Server();
server.start();
