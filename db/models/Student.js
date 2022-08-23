// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInstance, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInstance();

const Student = sequelize.define(
  "student",
  {
    studentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    linkId: {
      type: Sequelize.INTEGER,
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
 * @prop {string} phone
 * @prop {string} name
 * @prop {number | null} [linkId]
 *
 * @typedef TAdditionalModelAttributes
 * @prop {number} studentId
 * @prop {number | null} linkId
 *
 * @typedef {TCreationAttributes & TAdditionalModelAttributes} TModelAttributes
 *
 * @typedef {Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes} TModel
 */

module.exports = /** @type {Sequelize.ModelCtor<TModel>} */ (Student);
