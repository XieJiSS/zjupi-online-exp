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
export declare type CameraModelAttributes = CameraCreationAttributes & Readonly<CameraAdditionalModelAttributesReadonly>;
export declare type CameraModel = Sequelize.Model<CameraModelAttributes, CameraCreationAttributes> & CameraModelAttributes;
export declare type CameraModelCtor = Sequelize.ModelCtor<CameraModel>;
export default Camera;
