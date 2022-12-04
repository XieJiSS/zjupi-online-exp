/** @format */

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();
assert(sequelize !== null);

import getLogger from "../../util/logger";
const logger = getLogger("access-link-model");

const AccessLink: AccessLinkModelCtor = sequelize.define(
  "access_link",
  {
    linkId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    linkPath: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    validAfter: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    validUntil: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    clientId: {
      type: Sequelize.STRING,
      // when removing an access link, the clientId will be set to null for a very short time
    },
    cameraId: {
      type: Sequelize.STRING, // name-like id
      allowNull: true,
    },
    isValid: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = /** @type {TModel} */ this;
        const validUntil = that.getDataValue("validUntil");
        const validAfter = that.getDataValue("validAfter");
        if (!validUntil || !validAfter) {
          // https://github.com/sequelize/sequelize/issues/13284
          // in getters, properties might not yet exist, so we have to check
          logger.info("isValid getter: validUntil or validAfter not yet set");
          return false;
        }
        return validUntil.getTime() > Date.now() && validAfter.getTime() < Date.now();
      },
      set(_) {
        logger.error("setter failed: isValid is a virtual field");
        return false;
      },
    },
  },
  {
    timestamps: false,
  }
);

export interface AccessLinkCreationAttributes {
  createdAt: Date;
  linkPath: string;
  validAfter: Date;
  validUntil: Date;
  clientId: string;
  cameraId?: string | null;
}

export interface AccessLinkAdditionalModelAttributesWriteable {
  linkId: number;
  cameraId: string | null;
}

export interface AccessLinkAdditionalModelAttributesReadonly {
  isValid: boolean;
}

export type AccessLinkModelAttributes = AccessLinkCreationAttributes &
  AccessLinkAdditionalModelAttributesWriteable &
  Readonly<AccessLinkAdditionalModelAttributesReadonly>;
export type AccessLinkModel = Sequelize.Model<AccessLinkModelAttributes, AccessLinkCreationAttributes> &
  AccessLinkModelAttributes;
export type AccessLinkModelCtor = Sequelize.ModelStatic<AccessLinkModel>;

export default AccessLink;
