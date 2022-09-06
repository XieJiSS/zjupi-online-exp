// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const logger = require("../../util/logger")("RemoteClientModel");
const sequelize = getGlobalSequelizeInstance();

const RemoteClient = sequelize.define(
  "remote_client",
  {
    clientId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordExpireAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    nextPassword: {
      type: Sequelize.STRING,
      allowNull: true,
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
        const that = /** @type {TModel} */ (this);
        return Date.now() - (that.lastActive?.getTime() ?? 0) < 1000 * 60 * 3;
      },
      set(_) {
        logger.error("Do not try to set the online attribute of the RemoteClient Model!");
        return false;
      },
    },
    isDead: {
      type: Sequelize.VIRTUAL,
      get() {
        const that = /** @type {TModel} */ (this);
        return that.online ? false : Date.now() - (that.lastActive?.getTime() ?? 0) >= 1000 * 60 * 30;
      },
      set(_) {
        logger.error("Do not try to set the isDead attribute of the RemoteClient Model!");
        return false;
      },
    },
    linkId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef TCreationAttributes
 * @prop {string} clientId
 * @prop {string} password
 * @prop {Date} passwordExpireAt
 * @prop {string | null} [nextPassword]
 * @prop {string} ip
 * @prop {Date} lastActive
 * @prop {number | null} [linkId]
 *
 * @typedef TAdditionalModelAttributes
 * @prop {string | null} nextPassword
 * @prop {boolean} online
 * @prop {boolean} isDead
 * @prop {number | null} linkId
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributes} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (RemoteClient);
