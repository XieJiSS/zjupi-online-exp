/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const DBLog: DBLogModelCtor = sequelize.define(
  "db_log",
  {
    logId: {
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
    level: {
      type: Sequelize.ENUM("info", "warn", "error"),
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    source: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

export interface DBLogCreationAttributes {
  createdAt?: Date;
  text: string;
  source: string;
  level: "info" | "warn" | "error";
}

export interface DBLogAdditionalModelAttributes {
  logId: number;
  createdAt: Date;
}

export type DBLogModelAttributes = DBLogCreationAttributes & DBLogAdditionalModelAttributes;
export type DBLogModel = Sequelize.Model<DBLogModelAttributes, DBLogCreationAttributes> & DBLogModelAttributes;
export type DBLogModelCtor = Sequelize.ModelStatic<DBLogModel>;

export default DBLog;
