// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _RemoteClient = sequelize.define(
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
      defaultValue: null,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastActive: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    online: {
      type: Sequelize.VIRTUAL,
      get() {
        /**
         * @type {number | null}
         */
        // @ts-ignore
        const lastActive = this.lastActive;
        return lastActive === null ? false : Date.now() - lastActive < 1000 * 60 * 3;
      },
      set(_) {
        throw new Error("Do not try to set the online attribute of the RemoteClient Model!");
      },
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
 * @prop {Date | null} lastActive
 *
 * @typedef TAdditionalModelAttributes
 * @prop {boolean} online
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const RemoteClient = _RemoteClient;

module.exports = RemoteClient;
