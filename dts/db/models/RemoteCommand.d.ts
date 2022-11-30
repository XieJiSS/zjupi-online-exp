import Sequelize from "sequelize";
declare const RemoteCommand: RemoteCommandModelCtor;
export interface RemoteCommandCreationAttributes {
    createdAt?: Date;
    status: "running" | "finished" | "failed";
    command: string;
    args: string;
    displayText: string;
    reportedResult?: string | null;
    reportedAt?: Date | null;
    clientId: string;
}
export interface RemoteCommandAdditionalModelAttributes {
    commandId: number;
    createdAt: Date;
    reportedResult: string | null;
    reportedAt: Date | null;
}
export type RemoteCommandModelAttributes = RemoteCommandCreationAttributes & RemoteCommandAdditionalModelAttributes;
export type RemoteCommandModel = Sequelize.Model<RemoteCommandModelAttributes, RemoteCommandCreationAttributes> & RemoteCommandModelAttributes;
export type RemoteCommandModelCtor = Sequelize.ModelCtor<RemoteCommandModel>;
export default RemoteCommand;
