/** @format */
import Sequelize from "sequelize";
declare const Sensor: SensorModelCtor;
export interface SensorCreationAttributes {
    id: string;
    state: boolean;
    value: number;
}
export type SensorModelAttributes = SensorCreationAttributes;
export type SensorModel = Sequelize.Model<SensorModelAttributes, SensorCreationAttributes> & SensorModelAttributes;
export type SensorModelCtor = Sequelize.ModelStatic<SensorModel>;
export default Sensor;
