/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed());

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

import getLogger from "../../util/logger";
const logger = getLogger("camera-model");

const Camera: CameraModelCtor = sequelize.define(
  "camera",
  {
    cameraId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastActive: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    online: {
      type: Sequelize.VIRTUAL,
      get() {
        return Date.now() - (this.getDataValue("lastActive")?.getTime() ?? 0) < 1000 * 60 * 3;
      },
      set(_) {
        logger.error("Do not try to set the online attribute of the RemoteClient Model!");
        return false;
      },
    },
    reportedErrors: {
      type: Sequelize.STRING,
      allowNull: true,
      get(): string[] {
        // type is Sequelize.STRING
        const serializedErrors = this.getDataValue("reportedErrors") as unknown as string;
        if (!serializedErrors) return [];

        try {
          const errors = JSON.parse(serializedErrors);
          if (!Array.isArray(errors)) {
            logger.error("getter: reportedErrors is not an array:", errors);
            return [];
          } else {
            return errors;
          }
        } catch (err) {
          logger.error("getter: reportedErrors is not valid JSON:", serializedErrors);
          return [];
        }
      },
      set(errors) {
        if (!Array.isArray(errors)) {
          logger.error("setter: reportedErrors is not an array:", errors);
          return false;
        }

        let serializedErrors: string;
        try {
          serializedErrors = JSON.stringify(errors);
        } catch (err) {
          logger.error("setter: reportedErrors is not valid JSON:", errors);
          return false;
        }

        // type is Sequelize.STRING
        this.setDataValue("reportedErrors", serializedErrors as unknown as string[]);
        return true;
      },
    },
  },
  {
    timestamps: false,
  }
);

export interface CameraCreationAttributes {
  cameraId: string;
  ip: string;
  lastActive: Date;
}

export interface CameraAdditionalModelAttributesReadonly {
  online: boolean;
  reportedErrors: string[];
}

export type CameraModelAttributes = CameraCreationAttributes & Readonly<CameraAdditionalModelAttributesReadonly>;
export type CameraModel = Sequelize.Model<CameraModelAttributes, CameraCreationAttributes> & CameraModelAttributes;
export type CameraModelCtor = Sequelize.ModelStatic<CameraModel>;

export default Camera;
