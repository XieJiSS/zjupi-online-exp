/** @format */
import type { CameraModel, DoorLockModel, LampModel, SensorModel, SwitchModel, RemoteClientModel, PlaceModel } from "../models/all-models";
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr, TPartialModelPrimitive } from "../../types/type-helper";
/**
 * x, y are positions by percentage, range [0, 1]
 */
export interface DevicePosition {
    x: number;
    y: number;
}
export declare enum DeviceEnum {
    SWITCH = "switch",
    LAMP = "lamp",
    SENSOR = "sensor",
    DOORLOCK = "doorlock",
    CAMERA = "camera",
    RCLIENT = "rclient"
}
export interface DevicePrimitive {
    type: DeviceEnum;
    deviceId: string;
}
export type DeviceModel = CameraModel | RemoteClientModel | LampModel | SwitchModel | SensorModel | DoorLockModel;
export type VirtualDeviceType = Exclude<DeviceEnum, DeviceEnum.CAMERA | DeviceEnum.RCLIENT>;
export type VirtualDeviceModel = Exclude<DeviceModel, CameraModel | RemoteClientModel>;
export interface DeviceModelWrapper {
    type: DeviceEnum;
    device: DeviceModel;
}
export type VirtualDeviceModelResp = TPartialModelPrimitive<VirtualDeviceModel, "id" | "state" | "value">;
export type CameraDeviceModelResp = TPartialModelPrimitive<CameraModel, "cameraId" | "online" | "ip">;
export type RClientDeviceModelResp = TPartialModelPrimitive<RemoteClientModel, "clientId" | "online" | "ip">;
export interface DeviceModelWrapperResp {
    type: DeviceEnum;
    device: VirtualDeviceModelResp | CameraDeviceModelResp | RClientDeviceModelResp;
}
export type UnifiedDevice = TPartialModelPrimitive<VirtualDeviceModel, "id" | "state" | "value">;
export interface UnifiedDeviceModelWrapperResp {
    type: DeviceEnum;
    device: UnifiedDevice;
}
export interface VirtualDeviceModelWrapper {
    type: VirtualDeviceType;
    device: VirtualDeviceModel;
}
export interface VirtualDeviceModelWrapperResp {
    type: VirtualDeviceType;
    device: TPartialModelPrimitive<VirtualDeviceModel, "id" | "state" | "value">;
}
export declare function createDoorLock(id: string): Promise<DoorLockModel | null>;
export declare function getDoorLockById(id: string): Promise<DoorLockModel | null>;
export declare function getDoorLockByIdAttrsOnly<T extends TExtractAttrsFromModel<DoorLockModel>>(id: string, attributes: Readonly<T[]>): Promise<TPartialModel<DoorLockModel, T> | null>;
export declare function getAllDoorLocks(): Promise<DoorLockModel[]>;
export declare function createLamp(id: string): Promise<LampModel | null>;
export declare function getLampById(id: string): Promise<LampModel | null>;
export declare function getLampByIdAttrsOnly<T extends TExtractAttrsFromModel<LampModel>>(id: string, attributes: Readonly<T[]>): Promise<TPartialModel<LampModel, T> | null>;
export declare function getAllLamps(): Promise<LampModel[]>;
export declare function createSwitch(id: string): Promise<SwitchModel | null>;
export declare function getSwitchById(id: string): Promise<SwitchModel | null>;
export declare function getSwitchByIdAttrsOnly<T extends TExtractAttrsFromModel<SwitchModel>>(id: string, attributes: Readonly<T[]>): Promise<TPartialModel<SwitchModel, T> | null>;
export declare function getAllSwitches(): Promise<SwitchModel[]>;
export declare function createSensor(id: string): Promise<SensorModel | null>;
export declare function getSensorById(id: string): Promise<SensorModel | null>;
export declare function getSensorByIdAttrsOnly<T extends TExtractAttrsFromModel<SensorModel>>(id: string, attributes: Readonly<T[]>): Promise<TPartialModel<SensorModel, T> | null>;
export declare function getAllSensors(): Promise<SensorModel[]>;
export declare function createPlace(placeId: string, image: string): Promise<PlaceModel | null>;
export declare function deletePlaceById(placeId: string): Promise<void>;
export declare function getPlaceById(placeId: string): Promise<PlaceModel | null>;
export declare function getPlaceByIdAttrsOnly<T extends TExtractAttrsFromModel<PlaceModel>>(placeId: string, attributes: Readonly<T[]>): Promise<TPartialModel<PlaceModel, T> | null>;
export declare function getAllPlaces(): Promise<PlaceModel[]>;
export declare function getAllPlacesAttrsOnly<T extends TExtractAttrsFromModel<PlaceModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<PlaceModel, T>>;
export declare function getDevicePrimitivesByPlaceId(placeId: string): Promise<DevicePrimitive[]>;
export declare function findDeviceInDevices(devices: DevicePrimitive[], deviceId: string, type: DeviceEnum): DevicePrimitive | undefined;
export declare function getDeviceModelFromDevicePrimitive(device: DevicePrimitive): Promise<DeviceModelWrapper | null>;
export declare function getDeviceModelsFromDevicePrimitives(devices: DevicePrimitive[]): Promise<DeviceModelWrapper[]>;
export declare function createVirtualDeviceModelFromDevicePrimitive(device: DevicePrimitive): Promise<VirtualDeviceModelWrapper | null>;
export declare function getPositionByDevice(device: DevicePrimitive): Promise<import("../models/Position").PositionModel | null>;
export declare function updateDevicePosition(placeId: string, deviceId: string, type: DeviceEnum, newPosition: DevicePosition): Promise<boolean>;
export declare function updateDeviceState(placeId: string, deviceId: string, type: VirtualDeviceType, newState: boolean): Promise<boolean>;
export declare function updateDeviceValue(placeId: string, deviceId: string, type: VirtualDeviceType, newValue: number): Promise<boolean>;
export declare function removeDeviceFromPlace(placeId: string, deviceId: string, type: DeviceEnum): Promise<boolean>;
export declare function createVirtualDevice(deviceId: string, type: VirtualDeviceType, pos: DevicePosition): Promise<false | null>;
/**
 * @description This includes a call to removeDeviceFromPlace.
 */
export declare function deleteVirtualDevice(placeId: string, deviceId: string, type: VirtualDeviceType): Promise<boolean>;
export declare function deleteDevice(placeId: string, deviceId: string, type: DeviceEnum): Promise<boolean>;
