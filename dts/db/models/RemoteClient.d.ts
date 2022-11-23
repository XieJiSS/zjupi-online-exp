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
export declare type RemoteClientModelAttributes = RemoteClientCreationAttributes & RemoteClientAdditionalModelAttributes;
export declare type RemoteClientModel = Sequelize.Model<RemoteClientModelAttributes, RemoteClientCreationAttributes> & RemoteClientModelAttributes;
export declare type RemoteClientModelCtor = Sequelize.ModelCtor<RemoteClientModel>;
export default RemoteClient;
