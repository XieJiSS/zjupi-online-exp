/**
 * @format
 * @file This model will be used by express-session
 */

import assert from "assert";
import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const Session: SessionModelCtor = sequelize.define(
  "session",
  {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    expires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    data: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
  }
);

export interface SessionCreationAttributes {
  sid: string;
  expires: Date | null;
  data: string | null;
}

export interface SessionAdditionalModelAttributes {}

export type SessionModelAttributes = SessionCreationAttributes & SessionAdditionalModelAttributes;
export type SessionModel = Sequelize.Model<SessionModelAttributes, SessionCreationAttributes> & SessionModelAttributes;
export type SessionModelCtor = Sequelize.ModelCtor<SessionModel>;

export default Session;
