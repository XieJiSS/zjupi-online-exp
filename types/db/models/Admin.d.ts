declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    username: string;
    hash: string;
    salt: string;
    lastLoginIP?: string | null;
};
export type TAdditionalModelAttributes = {
    adminId: number;
    lastLoginIP: string | null;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
