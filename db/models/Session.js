// @ts-check
/**
 * @description This model will be used by express-session
 */

const assert = require("assert");
const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();

const Session = sequelize.define(
  "session",
  {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    expires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    data: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef TCreationAttributes
 * @prop {string} sid
 * @prop {Date} expires
 * @prop {string} data
 *
 * @typedef {{}} TAdditionalModelAttributes
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributes} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (Session);
