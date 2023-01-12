/** @format */
import Sequelize from "sequelize";
declare const Switch: SwitchModelCtor;
export interface SwitchCreationAttributes {
    id: string;
    state: boolean;
    value: number;
}
export type SwitchModelAttributes = SwitchCreationAttributes;
export type SwitchModel = Sequelize.Model<SwitchModelAttributes, SwitchCreationAttributes> & SwitchModelAttributes;
export type SwitchModelCtor = Sequelize.ModelStatic<SwitchModel>;
export default Switch;
