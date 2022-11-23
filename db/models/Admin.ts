import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "db/connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();

const Admin: AdminModelCtor = sequelize.define(
  "admin",
  {
    adminId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastLoginIP: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export interface AdminCreationAttributes {
  username: string;
  hash: string;
  salt: string;
  lastLoginIP?: string | null;
}

export interface AdminAdditionalModelAttributes {
  adminId: number;
  lastLoginIP: string | null;
}

export type AdminModelAttributes = AdminCreationAttributes & AdminAdditionalModelAttributes;
export type AdminModel = Sequelize.Model<AdminModelAttributes, AdminCreationAttributes> & AdminModelAttributes;
export type AdminModelCtor = Sequelize.ModelCtor<AdminModel>;

export default Admin;
