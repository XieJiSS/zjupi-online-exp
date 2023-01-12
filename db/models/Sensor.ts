/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const Sensor: SensorModelCtor = sequelize.define(
  "sensor",
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

export interface SensorCreationAttributes {
  id: string;
  state: boolean;
  value: number;
}

export type SensorModelAttributes = SensorCreationAttributes;
export type SensorModel = Sequelize.Model<SensorModelAttributes, SensorCreationAttributes> & SensorModelAttributes;
export type SensorModelCtor = Sequelize.ModelStatic<SensorModel>;

export default Sensor;
