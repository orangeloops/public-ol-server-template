import * as _ from "lodash";
import {Table, Column, Model, CreatedAt, UpdatedAt, DeletedAt, DataType, BeforeCreate} from "sequelize-typescript";
import AuthenticationHelper from "../../modules/authentication/Helper";
import {UserRef} from "../../modules/common/Models";

export enum UserStatus {
  Pending = 0,
  Active = 1,
  Blocked = -1,
}

export type StatusData = {
  activation: {
    code: string;
    codeDate: Date;
  };
  resetPassword: {
    code: string;
    codeDate: Date;
  };
};

export type RefreshToken = {
  token: string;
  enabled: boolean;
};

@Table({tableName: "user"})
export default class User extends Model<User> {
  @Column({type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4})
  id: string;

  @Column({allowNull: false, validate: {notEmpty: true}})
  name: string;

  @Column({allowNull: false, unique: true, validate: {notEmpty: true, isEmail: true}})
  email: string;

  @Column({allowNull: false, validate: {notEmpty: true}})
  password: string;

  @Column({type: DataType.JSONB})
  refreshTokens: RefreshToken[];

  @Column({allowNull: false, defaultValue: UserStatus.Pending})
  status: UserStatus;

  @Column({type: DataType.JSONB})
  customData: StatusData;

  @Column
  imageUrl: string;

  @CreatedAt
  createdDate: Date;

  @UpdatedAt
  modifiedDate: Date;

  @DeletedAt
  deletedDate: Date;

  @BeforeCreate
  static async hashPassword(user: User) {
    user.password = await AuthenticationHelper.generatePasswordHash(user.password);
  }

  @BeforeCreate
  static defaultImageUrl(user: User) {
    if (_.isNil(user.imageUrl)) user.imageUrl = "https://storage.googleapis.com/ideasource.appspot.com/image/user-default.png";
  }

  static getDomain(user: User | UserRef): string | undefined {
    let result: string = undefined;

    if (!_.isNil(user.email)) {
      const atIndex = user.email.indexOf("@");
      if (atIndex >= 0) result = user.email.substring(atIndex + 1);
    }

    return result;
  }
}
