// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();
const logger = require("../../util/logger")("AccessLinkModel");

const AccessLink = sequelize.define(
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
      defaultValue: Sequelize.fn("now"),
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
      allowNull: false,
    },
    cameraId: {
      type: Sequelize.STRING, // name-like id
      allowNull: true,
      defaultValue: null,
    },
    isValid: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = /** @type {TModel} */ (this);
        return that.validUntil.getTime() > Date.now() && that.validAfter.getTime() < Date.now();
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

/**
 * @typedef TCreationAttributes
 * @prop {Date} [createdAt]
 * @prop {string} linkPath
 * @prop {Date} validAfter
 * @prop {Date} validUntil
 * @prop {string} clientId
 * @prop {string | null} [cameraId]
 *
 * @typedef TAdditionalModelAttributesWriteable
 * @prop {number} linkId
 * @prop {Date} createdAt
 * @prop {string | null} cameraId
 *
 * @typedef TAdditionalModelAttributesReadonly
 * @prop {boolean} isValid
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributesWriteable & Readonly<TAdditionalModelAttributesReadonly>} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (AccessLink);
