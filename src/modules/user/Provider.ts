import * as _ from "lodash";
import {Injectable} from "@graphql-modules/di";
import {ForbiddenError} from "apollo-server";
import CommonHelper from "../common/Helper";
import {UserProviderType} from "./Helper";
import User from "../../db/models/User";
import {FileType, ServerContext, FileOwnerType} from "../common/Models";
import {DestroyOptions} from "sequelize";

@Injectable()
export default class UserProvider implements UserProviderType {
  async me({models, currentUser}: ServerContext): Promise<User> {
    if (_.isNil(currentUser)) return undefined;

    return models.User.findByPk(currentUser.id);
  }

  async user(id: string, {models}: ServerContext): Promise<User> {
    return models.User.findByPk(id);
  }

  async updateUser(id: string, name: string, upload: any, {storage, models}: ServerContext): Promise<User> {
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

  async deleteUser(id: string, {storage, models, currentUser}: ServerContext): Promise<boolean> {
    if (_.isNil(currentUser) || currentUser.id !== id) throw new ForbiddenError("Invalid user");

    const destroyOptions: DestroyOptions = {where: {id: id}};

    const result = await models.User.destroy(destroyOptions);

    if (result) await CommonHelper.deleteFile(storage, FileOwnerType.User, id);

    return result > 0;
  }
}
