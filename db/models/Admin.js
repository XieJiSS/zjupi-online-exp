// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _Admin = sequelize.define(
  "admin",
  {
    adminId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastLoginIP: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    session: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef TCreationAttributes
 * @prop {string} username
 * @prop {string} hash
 * @prop {string} salt
 * @prop {string | null} [lastLoginIP]
 * @prop {string | null} [session]
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} adminId
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const Admin = _Admin;

module.exports = Admin;
