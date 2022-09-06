declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    createdAt: Date;
    linkPath: string;
    validAfter: Date;
    validUntil: Date;
    clientId: string;
    cameraId?: string | null;
};
export type TAdditionalModelAttributesWriteable = {
    linkId: number;
    cameraId: string | null;
};
export type TAdditionalModelAttributesReadonly = {
    isValid: boolean;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributesWriteable & Readonly<TAdditionalModelAttributesReadonly>;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
