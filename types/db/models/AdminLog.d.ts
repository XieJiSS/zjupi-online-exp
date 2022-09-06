declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    createdAt?: Date;
    text: string;
    /**
     * __filename
     */
    source: string;
    level: "info" | "warn" | "error";
};
export type TAdditionalModelAttributes = {
    logId: number;
    createdAt: Date;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
