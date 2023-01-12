/** @format */
import Sequelize from "sequelize";
import { DeviceEnum, DevicePosition } from "../api/devices-api";
declare const Position: PositionModelCtor;
export interface PositionCreationAttributes {
    deviceId: string;
    type: DeviceEnum;
    position: DevicePosition;
}
export type PositionModelAttributes = PositionCreationAttributes;
export type PositionModel = Sequelize.Model<PositionModelAttributes, PositionCreationAttributes> & PositionModelAttributes;
export type PositionModelCtor = Sequelize.ModelStatic<PositionModel>;
export default Position;
