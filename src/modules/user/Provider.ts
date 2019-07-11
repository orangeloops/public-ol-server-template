import * as _ from "lodash";
import {Injectable} from "@graphql-modules/di";
import {ForbiddenError} from "apollo-server";
import CommonHelper from "../common/Helper";
import {IUserProvider} from "./Helper";
import User from "../../db/models/User";
import {FileType, IServerContext, FileOwnerType} from "../common/Models";
import {DestroyOptions} from "sequelize";

@Injectable()
export default class UserProvider implements IUserProvider {
  async me({models, currentUser}: IServerContext): Promise<User> {
    if (_.isNil(currentUser)) return undefined;

    return await models.User.findByPk(currentUser.id);
  }

  async user(id: string, {models}: IServerContext): Promise<User> {
    return await models.User.findByPk(id);
  }

  async updateUser(id: string, name: string, upload: any, {storage, models}: IServerContext): Promise<User> {
    const object = await models.User.findByPk(id);

    if (_.isNil(object)) return;

    const values: any = {};

    if (!_.isNil(name) && !_.isEmpty(name)) values.name = name;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.User, object.id, upload, {
        _ownerId: object.id,
        _ownerType: FileOwnerType.User,
        _fileType: FileType.Image,
      });

      if (!_.isNil(uploadResponse.publicUrl)) values.imageUrl = uploadResponse.publicUrl;
    }

    if (!_.isEmpty(values)) {
      await object.update(values);
    }

    return object;
  }

  async deleteUser(id: string, {storage, models, currentUser}: IServerContext): Promise<User> {
    if (_.isNil(currentUser) || currentUser.id !== id) throw new ForbiddenError("Invalid user");

    const destroyOptions: DestroyOptions = {where: {id: id}};

    const result = await models.User.destroy(destroyOptions);

    if (result) await CommonHelper.deleteFile(storage, FileOwnerType.User, id);

    return result;
  }
}
