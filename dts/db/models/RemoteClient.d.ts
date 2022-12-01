/** @format */
import Sequelize from "sequelize";
declare const RemoteClient: RemoteClientModelCtor;
export interface RemoteClientCreationAttributes {
    clientId: string;
    password: string;
    passwordExpireAt: Date;
    nextPassword?: string | null;
    ip: string;
    lastActive: Date;
    linkId?: number | null;
}
export interface RemoteClientAdditionalModelAttributes {
    nextPassword: string | null;
    online: boolean;
    isDead: boolean;
    linkId: number | null;
}
export type RemoteClientModelAttributes = RemoteClientCreationAttributes & RemoteClientAdditionalModelAttributes;
export type RemoteClientModel = Sequelize.Model<RemoteClientModelAttributes, RemoteClientCreationAttributes> & RemoteClientModelAttributes;
export type RemoteClientModelCtor = Sequelize.ModelCtor<RemoteClientModel>;
export default RemoteClient;
