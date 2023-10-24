/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed());

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const RemoteCommand: RemoteCommandModelCtor = sequelize.define(
  "remote_command",
  {
    commandId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("queued", "running", "finished", "failed"),
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
    explanation: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
    executingAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    // for finished and failed
    reportedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reportedResult: {
      type: Sequelize.STRING,
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

export type REMOTE_CMD_STATE = "queued" | "running" | "finished" | "failed";
export interface RemoteCommandCreationAttributes {
  status: REMOTE_CMD_STATE;
  args: string;
  command: string;
  createdAt?: Date;
  executingAt?: Date;
  explanation: string;
  reportedResult?: string | null;
  reportedAt?: Date | null;
  clientId: string;
}

export interface RemoteCommandAdditionalModelAttributes {
  commandId: number;
  createdAt: Date;
  executingAt: Date | null;
  reportedAt: Date | null;
  reportedResult: string | null;
}

export type RemoteCommandModelAttributes = RemoteCommandCreationAttributes & RemoteCommandAdditionalModelAttributes;
export type RemoteCommandModel = Sequelize.Model<RemoteCommandModelAttributes, RemoteCommandCreationAttributes> &
  RemoteCommandModelAttributes;
export type RemoteCommandModelCtor = Sequelize.ModelStatic<RemoteCommandModel>;

export default RemoteCommand;
