// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();
const logger = require("../../util/logger")("AccessLinkModel");

const _AccessLink = sequelize.define(
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
    link: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    validateUntil: {
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
        /**
         * @type {TModel}
         */
        // @ts-ignore
        const that = this;
        return that.validateUntil.getTime() > Date.now();
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
 * @prop {string} link
 * @prop {Date} validateUntil
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
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributesWriteable & Readonly<TAdditionalModelAttributesReadonly>}
 *
 * @typedef TModel
 * @type {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<TModel>}
 */
// @ts-ignore
const AccessLink = _AccessLink;

module.exports = AccessLink;
