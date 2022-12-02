/** @format */
import Sequelize from "sequelize";
declare const Camera: CameraModelCtor;
export interface CameraCreationAttributes {
    cameraId: string;
    ip: string;
    lastActive: Date;
}
export interface CameraAdditionalModelAttributesReadonly {
    online: boolean;
    reportedErrors: string[];
}
export type CameraModelAttributes = CameraCreationAttributes & Readonly<CameraAdditionalModelAttributesReadonly>;
export type CameraModel = Sequelize.Model<CameraModelAttributes, CameraCreationAttributes> & CameraModelAttributes;
export type CameraModelCtor = Sequelize.ModelStatic<CameraModel>;
export default Camera;
