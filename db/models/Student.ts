// @ts-check

import assert from "assert";

import { getGlobalSequelizeInstance, hasAuthed } from "../connect";
assert(hasAuthed);

import Sequelize from "sequelize";
const sequelize = getGlobalSequelizeInstance();

const Student: StudentModelCtor = sequelize.define(
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
    },
  },
  {
    timestamps: false,
  }
);

export interface StudentCreationAttributes {
  phone: string;
  name: string;
  linkId?: number | null;
}

export interface StudentAdditionalModelAttributes {
  studentId: number;
  linkId: number | null;
}

export type StudentModelAttributes = StudentCreationAttributes & StudentAdditionalModelAttributes;
export type StudentModel = Sequelize.Model<StudentModelAttributes, StudentCreationAttributes> & StudentModelAttributes;
export type StudentModelCtor = Sequelize.ModelCtor<StudentModel>;

export default Student;
