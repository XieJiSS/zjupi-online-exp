/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const DoorLock: DoorLockModelCtor = sequelize.define(
  "door_lock",
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

export interface DoorLockCreationAttributes {
  id: string;
  state: boolean;
  value: number;
}

export type DoorLockModelAttributes = DoorLockCreationAttributes;
export type DoorLockModel = Sequelize.Model<DoorLockModelAttributes, DoorLockCreationAttributes> &
  DoorLockModelAttributes;
export type DoorLockModelCtor = Sequelize.ModelStatic<DoorLockModel>;

export default DoorLock;
