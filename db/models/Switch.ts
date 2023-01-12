/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const Switch: SwitchModelCtor = sequelize.define(
  "switch",
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

export interface SwitchCreationAttributes {
  id: string;
  state: boolean;
  value: number;
}

export type SwitchModelAttributes = SwitchCreationAttributes;
export type SwitchModel = Sequelize.Model<SwitchModelAttributes, SwitchCreationAttributes> & SwitchModelAttributes;
export type SwitchModelCtor = Sequelize.ModelStatic<SwitchModel>;

export default Switch;
