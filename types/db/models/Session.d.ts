declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    sid: string;
    expires: Date | null;
    data: string | null;
};
export type TAdditionalModelAttributes = {};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
