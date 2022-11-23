import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "db/connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();

import getLogger from "util/logger";
const logger = getLogger("remote-client-model");

const RemoteClient: RemoteClientModelCtor = sequelize.define(
  "remote_client",
  {
    clientId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordExpireAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    nextPassword: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastActive: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    online: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = this;
        return Date.now() - (that.lastActive.getTime() ?? 0) < 1000 * 45;
      },
      set(_) {
        logger.error("Do not try to set the online attribute of the RemoteClient Model!");
        return false;
      },
    },
    isDead: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = this;
        return that.online ? false : Date.now() - (that.lastActive.getTime() ?? 0) >= 1000 * 60 * 30;
      },
      set(_) {
        logger.error("Do not try to set the isDead attribute of the RemoteClient Model!");
        return false;
      },
    },
    linkId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export interface RemoteClientCreationAttributes {
  clientId: string;
  password: string;
  passwordExpireAt: Date;
  nextPassword?: string | null;
  ip: string;
  lastActive: Date;
  linkId?: number | null;
}

export interface RemoteClientAdditionalModelAttributes {
  nextPassword: string | null;
  online: boolean;
  isDead: boolean;
  linkId: number | null;
}

export type RemoteClientModelAttributes = RemoteClientCreationAttributes & RemoteClientAdditionalModelAttributes;
export type RemoteClientModel = Sequelize.Model<RemoteClientModelAttributes, RemoteClientCreationAttributes> &
  RemoteClientModelAttributes;
export type RemoteClientModelCtor = Sequelize.ModelCtor<RemoteClientModel>;

export default RemoteClient;
