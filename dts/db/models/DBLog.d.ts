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
export declare type DBLogModelAttributes = DBLogCreationAttributes & DBLogAdditionalModelAttributes;
export declare type DBLogModel = Sequelize.Model<DBLogModelAttributes, DBLogCreationAttributes> & DBLogModelAttributes;
export declare type DBLogModelCtor = Sequelize.ModelCtor<DBLogModel>;
export default DBLog;
