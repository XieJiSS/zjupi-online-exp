// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();

const Admin = sequelize.define(
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
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} adminId
 * @prop {string | null} lastLoginIP
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributes} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (Admin);
