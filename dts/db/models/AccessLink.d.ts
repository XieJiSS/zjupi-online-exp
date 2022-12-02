/** @format */
import Sequelize from "sequelize";
declare const AccessLink: AccessLinkModelCtor;
export interface AccessLinkCreationAttributes {
    createdAt: Date;
    linkPath: string;
    validAfter: Date;
    validUntil: Date;
    clientId: string;
    cameraId?: string | null;
}
export interface AccessLinkAdditionalModelAttributesWriteable {
    linkId: number;
    cameraId: string | null;
}
export interface AccessLinkAdditionalModelAttributesReadonly {
    isValid: boolean;
}
export type AccessLinkModelAttributes = AccessLinkCreationAttributes & AccessLinkAdditionalModelAttributesWriteable & Readonly<AccessLinkAdditionalModelAttributesReadonly>;
export type AccessLinkModel = Sequelize.Model<AccessLinkModelAttributes, AccessLinkCreationAttributes> & AccessLinkModelAttributes;
export type AccessLinkModelCtor = Sequelize.ModelStatic<AccessLinkModel>;
export default AccessLink;
