/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const Lamp: LampModelCtor = sequelize.define(
  "lamp",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    state: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    value: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export interface LampCreationAttributes {
  id: string;
  state: boolean;
  value: number;
}

export type LampModelAttributes = LampCreationAttributes;
export type LampModel = Sequelize.Model<LampModelAttributes, LampCreationAttributes> & LampModelAttributes;
export type LampModelCtor = Sequelize.ModelStatic<LampModel>;

export default Lamp;
