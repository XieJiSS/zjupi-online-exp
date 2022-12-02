/** @format */
import Sequelize from "sequelize";
declare const RemoteCommand: RemoteCommandModelCtor;
export type REMOTE_CMD_STATE = "queued" | "running" | "finished" | "failed";
export interface RemoteCommandCreationAttributes {
    status: REMOTE_CMD_STATE;
    args: string;
    command: string;
    createdAt?: Date;
    executingAt?: Date;
    explanation: string;
    reportedResult?: string | null;
    reportedAt?: Date | null;
    clientId: string;
}
export interface RemoteCommandAdditionalModelAttributes {
    commandId: number;
    createdAt: Date;
    executingAt: Date | null;
    reportedAt: Date | null;
    reportedResult: string | null;
}
export type RemoteCommandModelAttributes = RemoteCommandCreationAttributes & RemoteCommandAdditionalModelAttributes;
export type RemoteCommandModel = Sequelize.Model<RemoteCommandModelAttributes, RemoteCommandCreationAttributes> & RemoteCommandModelAttributes;
export type RemoteCommandModelCtor = Sequelize.ModelStatic<RemoteCommandModel>;
export default RemoteCommand;
