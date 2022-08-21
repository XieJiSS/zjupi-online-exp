// @ts-check

const assert = require("assert");

const { getGlobalSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getGlobalSequelizeInst();

const _Student = sequelize.define(
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
 *
 * @typedef TModelAttributes
 * @type {TCreationAttributes & TAdditionalModelAttributes}
 */

/**
 * @type {Sequelize.ModelCtor<Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes>}
 */
// @ts-ignore
const Student = _Student;

module.exports = Student;
