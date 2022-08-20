// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _RemoteCommand = sequelize.define(
  "remote_command",
  {
    commandId: {
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
    status: {
      type: Sequelize.ENUM("running", "finished", "failed"),
      allowNull: false,
      defaultValue: "running",
    },
    command: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    args: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    displayText: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    reportedResult: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    reportedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    clientId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef TCreationAttributes
 * @prop {Date} [createdAt]
 * @prop {"running" | "finished" | "failed"} [status]
 * @prop {string} command
 * @prop {string} args JSON of string[]
 * @prop {string} displayText
 * @prop {string | null} [reportedResult]
 * @prop {Date | null} [reportedAt]
 * @prop {string} clientId
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} commandId
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const RemoteCommand = _RemoteCommand;

module.exports = RemoteCommand;
