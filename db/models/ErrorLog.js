// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _ErrorLog = sequelize.define(
  "error_log",
  {
    errorId: {
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
    errorText: {
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
 * @prop {string} errorText
 * @prop {string} source __filename
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} errorId
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const ErrorLog = _ErrorLog;

module.exports = ErrorLog;
