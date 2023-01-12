/** @format */

import assert from "assert";
import type { DevicePrimitive } from "../api/devices-api";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

import getLogger from "../../util/logger";
const logger = getLogger("place-model");

const Place: PlaceModelCtor = sequelize.define(
  "place",
  {
    placeId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    image: {
      type: Sequelize.TEXT("long"),
      allowNull: false,
    },
    devices: {
      type: Sequelize.STRING,
      allowNull: false,
      get(): DevicePrimitive[] {
        // type is Sequelize.STRING
        const devicesStr = this.getDataValue("devices") as unknown as string;
        if (!devicesStr) return [];

        try {
          const devices = JSON.parse(devicesStr);
          if (!Array.isArray(devices)) {
            logger.error("getter: variable devices is not an array:", devices);
            return [];
          } else {
            return devices;
          }
        } catch (err) {
          logger.error("getter: devices is not valid JSON:", devicesStr);
          return [];
        }
      },
      set(devices: DevicePrimitive[]) {
        if (!Array.isArray(devices)) {
          logger.error("setter: devices is not an array:", devices);
          return false;
        }

        let devicesStr: string;
        try {
          devicesStr = JSON.stringify(devices);
        } catch (err) {
          logger.error("setter: devices is not valid JSON:", devices);
          return false;
        }

        // type is Sequelize.STRING
        this.setDataValue("devices", devicesStr as unknown as DevicePrimitive[]);
        return true;
      },
    },
  },
  {
    timestamps: false,
  }
);

export interface PlaceCreationAttributes {
  placeId: string;
  image: string;
  devices: DevicePrimitive[];
}

export interface PlaceAdditionalModelAttributesReadonly {
  placeId: string;
}

export type PlaceModelAttributes = PlaceCreationAttributes & Readonly<PlaceAdditionalModelAttributesReadonly>;
export type PlaceModel = Sequelize.Model<PlaceModelAttributes, PlaceCreationAttributes> & PlaceModelAttributes;
export type PlaceModelCtor = Sequelize.ModelStatic<PlaceModel>;

export default Place;
