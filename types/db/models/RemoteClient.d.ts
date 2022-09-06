declare const _exports: Sequelize.ModelCtor<TModel>;
export = _exports;
export type TCreationAttributes = {
    clientId: string;
    password: string;
    passwordExpireAt: Date;
    nextPassword?: string | null;
    ip: string;
    lastActive: Date;
    linkId?: number | null;
};
export type TAdditionalModelAttributes = {
    nextPassword: string | null;
    online: boolean;
    isDead: boolean;
    linkId: number | null;
};
export type TModelAttributes = TCreationAttributes & TAdditionalModelAttributes;
export type TModel = Sequelize.Model<TModelAttributes, TCreationAttributes> & TModelAttributes;
import Sequelize = require("sequelize");
