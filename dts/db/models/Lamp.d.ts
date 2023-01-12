/** @format */
import Sequelize from "sequelize";
declare const Lamp: LampModelCtor;
export interface LampCreationAttributes {
    id: string;
    state: boolean;
    value: number;
}
export type LampModelAttributes = LampCreationAttributes;
export type LampModel = Sequelize.Model<LampModelAttributes, LampCreationAttributes> & LampModelAttributes;
export type LampModelCtor = Sequelize.ModelStatic<LampModel>;
export default Lamp;
