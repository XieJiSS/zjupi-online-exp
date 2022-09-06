declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    cameraId: string;
    ip: string;
    lastActive: Date;
};
export type TAdditionalModelAttributesReadonly = {
    online: boolean;
};
export type TModelAttributes = TCreationAttributes & Readonly<TAdditionalModelAttributesReadonly>;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
