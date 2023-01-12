/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
import { DeviceEnum, DevicePosition } from "../api/devices-api";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

const Position: PositionModelCtor = sequelize.define(
  "position",
  {
    deviceId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    position: {
      type: Sequelize.STRING,
      allowNull: false,
      get(): DevicePosition {
        // type is Sequelize.STRING
        const positionString = this.getDataValue("position") as unknown as string;
        if (!positionString) return { x: 0, y: 0 };

        try {
          const position = JSON.parse(positionString) as DevicePosition;
          return position;
        } catch (err) {
          return { x: 0, y: 0 };
        }
      },
      set(pos: DevicePosition) {
        let positionString: string;
        try {
          positionString = JSON.stringify(pos);
        } catch (err) {
          return false;
        }

        // type is Sequelize.STRING
        this.setDataValue("position", positionString as unknown as DevicePosition);
        return true;
      },
    },
  },
  {
    timestamps: false,
  }
);

export interface PositionCreationAttributes {
  deviceId: string;
  type: DeviceEnum;
  position: DevicePosition;
}

export type PositionModelAttributes = PositionCreationAttributes;
export type PositionModel = Sequelize.Model<PositionModelAttributes, PositionCreationAttributes> &
  PositionModelAttributes;
export type PositionModelCtor = Sequelize.ModelStatic<PositionModel>;

export default Position;
