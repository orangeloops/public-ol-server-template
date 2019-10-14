import * as winston from "winston";
import * as morgan from "morgan";
import cors = require("cors");
import {Express} from "express";
import {ApolloServer} from "apollo-server-express";
import {GraphQLModule} from "@graphql-modules/core";
import {createExpressServer} from "routing-controllers";
import {sequelize} from "./db/models";
import {CommonModule} from "./modules/common";
import {APIModule} from "./modules/api";
import {AuthenticationModule} from "./modules/authentication";
import {UserModule} from "./modules/user";

const fs = require("fs");
const https = require("https");
const http = require("http");

export const appModule = new GraphQLModule({
  imports: [CommonModule, APIModule, AuthenticationModule, UserModule],
});

const configurations: any = {
  // development: {ssl: true, port: 443, hostname: "localhost"},
  development: {ssl: false, port: process.env.PORT, hostname: "localhost"},
  production: {ssl: true, port: process.env.PORT},
};

const environment = process.env.NODE_ENV || "production";
const config: any = configurations[environment];

export class Server {
  public app: Express;
  public apolloServer: ApolloServer;

  private eraseDatabaseOnSync = false;

  constructor() {
    this.app = createExpressServer({
      cors: {
        credentials: true,
        preflightContinue: false,
      },
    });

    this.apolloServer = new ApolloServer({
      schema: appModule.schema,
      context: appModule.context,
      introspection: true,
      debug: true,
    });
  }

  start() {
    this.app.use(morgan("common"));
    this.app.use(cors());

    this.apolloServer.applyMiddleware({app: this.app, path: "/graphql"});

    sequelize.sync({force: this.eraseDatabaseOnSync}).then(async () => {
      let server;

      if (config.ssl) {
        server = https.createServer(
          {
            key: fs.readFileSync(`./config/ssl/server.key`),
            cert: fs.readFileSync(`./config/ssl/server.cert`),
          },
          this.app
        );
      } else {
        server = http.createServer(this.app);
      }

      server.listen({port: config.port}, () => winston.info(`🚀 Server ready at http${config.ssl ? "s" : ""}://${config.hostname}:${config.port}${this.apolloServer.graphqlPath}`));
    }).catch(err => console.error(err));
  }
}
