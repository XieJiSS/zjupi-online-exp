/** @format */
import Sequelize from "sequelize";
declare const RemoteClient: RemoteClientModelCtor;
export interface RemoteClientCreationAttributes {
    clientId: string;
    password: string;
    passwordExpireAt: Date;
    ip: string;
    lastActive: Date;
    linkId?: number | null;
}
export interface RemoteClientAdditionalModelAttributes {
    online: boolean;
    isDead: boolean;
    linkId: number | null;
}
export type RemoteClientModelAttributes = RemoteClientCreationAttributes & RemoteClientAdditionalModelAttributes;
export type RemoteClientModel = Sequelize.Model<RemoteClientModelAttributes, RemoteClientCreationAttributes> & RemoteClientModelAttributes;
export type RemoteClientModelCtor = Sequelize.ModelStatic<RemoteClientModel>;
export default RemoteClient;
