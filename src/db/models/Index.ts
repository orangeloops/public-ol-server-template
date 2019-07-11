import {Sequelize} from "sequelize-typescript";
import * as config from "../../Config";
import User from "./User";

const sequelize = new Sequelize({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  dialect: "postgres",
  options: {
    operatorsAliases: false,
  },
} as any);

const models = {
  User: User,
};

sequelize.addModels([User]);

Object.keys(models).forEach(key => {
  const model: any = (models as any)[key];

  if ("associate" in model) model.associate(models);
});

export {sequelize};

export default models;
