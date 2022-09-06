// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();

const AdminLog = sequelize.define(
  "admin_log",
  {
    logId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
    level: {
      type: Sequelize.ENUM("info", "warn", "error"),
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    source: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

/**
 * @typedef TCreationAttributes
 * @prop {Date} [createdAt]
 * @prop {string} text
 * @prop {string} source __filename
 * @prop {"info" | "warn" | "error"} level
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} logId
 * @prop {Date} createdAt
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributes} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (AdminLog);
