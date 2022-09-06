declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    phone: string;
    name: string;
    linkId?: number | null;
};
export type TAdditionalModelAttributes = {
    studentId: number;
    linkId: number | null;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
