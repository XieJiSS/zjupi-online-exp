/** @format */
import Sequelize from "sequelize";
declare const DoorLock: DoorLockModelCtor;
export interface DoorLockCreationAttributes {
    id: string;
    state: boolean;
    value: number;
}
export type DoorLockModelAttributes = DoorLockCreationAttributes;
export type DoorLockModel = Sequelize.Model<DoorLockModelAttributes, DoorLockCreationAttributes> & DoorLockModelAttributes;
export type DoorLockModelCtor = Sequelize.ModelStatic<DoorLockModel>;
export default DoorLock;
