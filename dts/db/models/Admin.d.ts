/** @format */
import Sequelize from "sequelize";
declare const Admin: AdminModelCtor;
export interface AdminCreationAttributes {
    username: string;
    hash: string;
    salt: string;
    lastLoginIP?: string | null;
}
export interface AdminAdditionalModelAttributes {
    adminId: number;
    lastLoginIP: string | null;
}
export type AdminModelAttributes = AdminCreationAttributes & AdminAdditionalModelAttributes;
export type AdminModel = Sequelize.Model<AdminModelAttributes, AdminCreationAttributes> & AdminModelAttributes;
export type AdminModelCtor = Sequelize.ModelCtor<AdminModel>;
export default Admin;
