/** @format */
import Sequelize from "sequelize";
declare const DBLog: DBLogModelCtor;
export interface DBLogCreationAttributes {
    createdAt?: Date;
    text: string;
    source: string;
    level: "info" | "warn" | "error";
}
export interface DBLogAdditionalModelAttributes {
    logId: number;
    createdAt: Date;
}
export type DBLogModelAttributes = DBLogCreationAttributes & DBLogAdditionalModelAttributes;
export type DBLogModel = Sequelize.Model<DBLogModelAttributes, DBLogCreationAttributes> & DBLogModelAttributes;
export type DBLogModelCtor = Sequelize.ModelStatic<DBLogModel>;
export default DBLog;
