/** @file This model will be used by express-session */
import Sequelize from "sequelize";
declare const Session: SessionModelCtor;
export interface SessionCreationAttributes {
    sid: string;
    expires: Date | null;
    data: string | null;
}
export interface SessionAdditionalModelAttributes {
}
export type SessionModelAttributes = SessionCreationAttributes & SessionAdditionalModelAttributes;
export type SessionModel = Sequelize.Model<SessionModelAttributes, SessionCreationAttributes> & SessionModelAttributes;
export type SessionModelCtor = Sequelize.ModelCtor<SessionModel>;
export default Session;
