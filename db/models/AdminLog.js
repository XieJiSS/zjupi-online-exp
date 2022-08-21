// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _AdminLog = sequelize.define(
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
      defaultValue: Sequelize.fn("now"),
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
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const AdminLog = _AdminLog;

module.exports = AdminLog;
