// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();
const logger = require("../../util/logger")("CameraModel");

const Camera = sequelize.define(
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
      defaultValue: Sequelize.fn("now"),
    },
    online: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = /** @type {TModel} */ (this);
        return that.lastActive === null ? false : Date.now() - that.lastActive.getTime() < 1000 * 60 * 3;
      },
      set(_) {
        logger.error("Do not try to set the online attribute of the RemoteClient Model!");
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
 * @prop {string} cameraId
 * @prop {string} ip
 * @prop {Date} [lastActive]
 *
 * @typedef TAdditionalModelAttributesWriteable
 * @prop {Date} lastActive
 *
 * @typedef TAdditionalModelAttributesReadonly
 * @prop {boolean} online
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributesWriteable & Readonly<TAdditionalModelAttributesReadonly>} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (Camera);
