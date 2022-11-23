import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();

const RemoteCommand: RemoteCommandModelCtor = sequelize.define(
  "remote_command",
  {
    commandId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
    status: {
      type: Sequelize.ENUM("running", "finished", "failed"),
      allowNull: false,
    },
    command: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    args: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    displayText: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    reportedResult: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    reportedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    clientId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export interface RemoteCommandCreationAttributes {
  createdAt?: Date;
  status: "running" | "finished" | "failed";
  command: string;
  args: string;
  displayText: string;
  reportedResult?: string | null;
  reportedAt?: Date | null;
  clientId: string;
}

export interface RemoteCommandAdditionalModelAttributes {
  commandId: number;
  createdAt: Date;
  reportedResult: string | null;
  reportedAt: Date | null;
}

export type RemoteCommandModelAttributes = RemoteCommandCreationAttributes & RemoteCommandAdditionalModelAttributes;
export type RemoteCommandModel = Sequelize.Model<RemoteCommandModelAttributes, RemoteCommandCreationAttributes> &
  RemoteCommandModelAttributes;
export type RemoteCommandModelCtor = Sequelize.ModelCtor<RemoteCommandModel>;

export default RemoteCommand;
