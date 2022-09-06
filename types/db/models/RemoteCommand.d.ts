declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    createdAt?: Date;
    status: "running" | "finished" | "failed";
    command: string;
    /**
     * JSON of string[]
     */
    args: string;
    displayText: string;
    reportedResult?: string | null;
    reportedAt?: Date | null;
    clientId: string;
};
export type TAdditionalModelAttributes = {
    commandId: number;
    createdAt: Date;
    reportedResult: string | null;
    reportedAt: Date | null;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
