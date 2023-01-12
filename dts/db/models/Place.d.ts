/** @format */
import type { DevicePrimitive } from "../api/devices-api";
import Sequelize from "sequelize";
declare const Place: PlaceModelCtor;
export interface PlaceCreationAttributes {
    placeId: string;
    image: string;
    devices: DevicePrimitive[];
}
export interface PlaceAdditionalModelAttributesReadonly {
    placeId: string;
}
export type PlaceModelAttributes = PlaceCreationAttributes & Readonly<PlaceAdditionalModelAttributesReadonly>;
export type PlaceModel = Sequelize.Model<PlaceModelAttributes, PlaceCreationAttributes> & PlaceModelAttributes;
export type PlaceModelCtor = Sequelize.ModelStatic<PlaceModel>;
export default Place;
