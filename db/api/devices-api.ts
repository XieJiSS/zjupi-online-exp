/** @format */

import assert from "assert";

import { hasAuthed } from "../connect";
assert(hasAuthed());

import { DoorLock, Lamp, Sensor, Switch, Place, Position } from "../models/all-models";

import type {
  CameraModel,
  DoorLockModel,
  LampModel,
  SensorModel,
  SwitchModel,
  RemoteClientModel,
  PlaceModel,
} from "../models/all-models";

import type {
  TExtractAttrsFromModel,
  TPartialModel,
  TPartialModelArr,
  TPartialModelPrimitive,
} from "../../types/type-helper";

import getLogger from "../../util/logger";
import { getPersistentLoggerUtil } from "./db-log-api";
const logger = getLogger("devices-api");
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import cameraApi from "./camera/camera-api";
import remoteControlApi from "./remote-control/remote-control-api";

/**
 * x, y are positions by percentage, range [0, 1]
 */
export interface DevicePosition {
  x: number;
  y: number;
}

export enum DeviceEnum {
  // these are virtual devices
  SWITCH = "switch",
  LAMP = "lamp",
  SENSOR = "sensor",
  DOORLOCK = "doorlock",
  // these are real devices
  CAMERA = "camera",
  RCLIENT = "rclient",
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

export async function createDoorLock(id: string) {
  if ((await getDoorLockById(id)) !== null) {
    logger.warn(`createDoorLock: door lock ${id} already exists`);
    return null;
  }
  return await DoorLock.create({
    id,
    state: false,
    value: 0,
  });
}

export async function getDoorLockById(id: string) {
  return await DoorLock.findOne({ where: { id } });
}

export async function getDoorLockByIdAttrsOnly<T extends TExtractAttrsFromModel<DoorLockModel>>(
  id: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<DoorLockModel, T> | null> {
  return (await DoorLock.findOne({
    where: { id },
    attributes: attributes as T[],
  })) as TPartialModel<DoorLockModel, T> | null;
}

export async function getAllDoorLocks() {
  return await DoorLock.findAll();
}

export async function createLamp(id: string) {
  if ((await getLampById(id)) !== null) {
    logger.warn(`createLamp: lamp ${id} already exists`);
    return null;
  }
  return await Lamp.create({
    id,
    state: false,
    value: 0.6,
  });
}

export async function getLampById(id: string) {
  return await Lamp.findOne({ where: { id } });
}

export async function getLampByIdAttrsOnly<T extends TExtractAttrsFromModel<LampModel>>(
  id: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<LampModel, T> | null> {
  return (await Lamp.findOne({
    where: { id },
    attributes: attributes as T[],
  })) as TPartialModel<LampModel, T> | null;
}

export async function getAllLamps() {
  return await Lamp.findAll();
}

export async function createSwitch(id: string) {
  if ((await getSwitchById(id)) !== null) {
    logger.warn(`createSwitch: switch ${id} already exists`);
    return null;
  }
  return await Switch.create({
    id,
    state: false,
    value: 0,
  });
}

export async function getSwitchById(id: string) {
  return await Switch.findOne({ where: { id } });
}

export async function getSwitchByIdAttrsOnly<T extends TExtractAttrsFromModel<SwitchModel>>(
  id: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<SwitchModel, T> | null> {
  return (await Switch.findOne({
    where: { id },
    attributes: attributes as T[],
  })) as TPartialModel<SwitchModel, T> | null;
}

export async function getAllSwitches() {
  return await Switch.findAll();
}

export async function createSensor(id: string) {
  if ((await getSensorById(id)) !== null) {
    logger.warn(`createSensor: sensor ${id} already exists`);
    return null;
  }
  return await Sensor.create({
    id,
    state: true,
    value: ~~(Math.random() * 60) / 2,
  });
}

export async function getSensorById(id: string) {
  return await Sensor.findOne({ where: { id } });
}

export async function getSensorByIdAttrsOnly<T extends TExtractAttrsFromModel<SensorModel>>(
  id: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<SensorModel, T> | null> {
  return (await Sensor.findOne({
    where: { id },
    attributes: attributes as T[],
  })) as TPartialModel<SensorModel, T> | null;
}

export async function getAllSensors() {
  return await Sensor.findAll();
}

export async function createPlace(placeId: string, image: string) {
  if ((await getPlaceById(placeId)) !== null) {
    logger.warn(`createPlace: place ${placeId} already exists`);
    return null;
  }
  return await Place.create({
    placeId,
    image,
    devices: [],
  });
}

export async function deletePlaceById(placeId: string) {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`deletePlaceById: place ${placeId} does not exists`);
    return;
  }

  const removePromises: Promise<boolean>[] = [];
  for (const device of place.devices) {
    removePromises.push(deleteDevice(placeId, device.deviceId, device.type));
  }

  await Promise.all(removePromises);

  await place.destroy();
}

export async function getPlaceById(placeId: string) {
  return await Place.findOne({ where: { placeId } });
}

export async function getPlaceByIdAttrsOnly<T extends TExtractAttrsFromModel<PlaceModel>>(
  placeId: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<PlaceModel, T> | null> {
  return (await Place.findOne({
    where: { placeId },
    attributes: attributes as T[],
  })) as TPartialModel<PlaceModel, T>;
}

export async function getAllPlaces() {
  return await Place.findAll();
}

export async function getAllPlacesAttrsOnly<T extends TExtractAttrsFromModel<PlaceModel>>(
  attributes: Readonly<T[]>
): Promise<TPartialModelArr<PlaceModel, T>> {
  return (await Place.findAll({
    attributes: attributes as T[],
  })) as TPartialModelArr<PlaceModel, T>;
}

export async function getDevicePrimitivesByPlaceId(placeId: string) {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`getDevicePrimitivesByPlaceId: place ${placeId} does not exist`);
    return [];
  }
  return place.devices;
}

export function findDeviceInDevices(devices: DevicePrimitive[], deviceId: string, type: DeviceEnum) {
  return devices.find((device) => device.deviceId === deviceId && device.type === type);
}

export async function getDeviceModelFromDevicePrimitive(device: DevicePrimitive): Promise<DeviceModelWrapper | null> {
  let model: DeviceModel | null = null;

  switch (device.type) {
    case DeviceEnum.DOORLOCK:
      model = await getDoorLockById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.DOORLOCK, device: model };
      }
      break;
    case DeviceEnum.LAMP:
      model = await getLampById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.LAMP, device: model };
      }
      break;
    case DeviceEnum.SWITCH:
      model = await getSwitchById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.SWITCH, device: model };
      }
      break;
    case DeviceEnum.SENSOR:
      model = await getSensorById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.SENSOR, device: model };
      }
      break;
    case DeviceEnum.CAMERA:
      model = await cameraApi.getCameraById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.CAMERA, device: model };
      }
      break;
    case DeviceEnum.RCLIENT:
      model = await remoteControlApi.getRemoteClientById(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.RCLIENT, device: model };
      }
      break;
    default:
      logger.warn(`getDeviceModelsFromDevicePrimitives: unknown device type ${device.type}`);
      break;
  }

  return null;
}

export async function getDeviceModelsFromDevicePrimitives(devices: DevicePrimitive[]) {
  const models: DeviceModelWrapper[] = [];

  for (const device of devices) {
    const deviceModel = await getDeviceModelFromDevicePrimitive(device);
    if (deviceModel !== null) {
      models.push(deviceModel);
    }
  }

  return models;
}

export async function createVirtualDeviceModelFromDevicePrimitive(
  device: DevicePrimitive
): Promise<VirtualDeviceModelWrapper | null> {
  let model: VirtualDeviceModel | null = null;

  switch (device.type) {
    case DeviceEnum.DOORLOCK:
      model = await createDoorLock(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.DOORLOCK, device: model };
      }
      break;
    case DeviceEnum.LAMP:
      model = await createLamp(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.LAMP, device: model };
      }
      break;
    case DeviceEnum.SWITCH:
      model = await createSwitch(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.SWITCH, device: model };
      }
      break;
    case DeviceEnum.SENSOR:
      model = await createSensor(device.deviceId);
      if (model !== null) {
        return { type: DeviceEnum.SENSOR, device: model };
      }
      break;
    default:
      logger.warn(`createVirtualDeviceModelFromDevicePrimitive: invalid device type ${device.type}`);
      break;
  }

  return model;
}

export async function getPositionByDevice(device: DevicePrimitive) {
  return await Position.findOne({ where: { deviceId: device.deviceId, type: device.type } });
}

export async function updateDevicePosition(
  placeId: string,
  deviceId: string,
  type: DeviceEnum,
  newPosition: DevicePosition
): Promise<boolean> {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`updateDevicePosition: place ${placeId} does not exist`);
    return false;
  }

  const devices = place.devices;

  let hasFound = false;
  for (const placeDevice of devices) {
    if (placeDevice.deviceId === deviceId && placeDevice.type === type) {
      const position = await getPositionByDevice(placeDevice);
      if (position === null) {
        logger.warn(`updateDevicePosition: position for device ${deviceId} ${type} does not exist`);
        await Position.create({
          deviceId,
          type,
          position: newPosition,
        });
        return false;
      }
      position.position = newPosition;
      await position.save();
      hasFound = true;
      break;
    }
  }

  if (!hasFound) {
    logger.warn(`updateDevicePosition: device ${deviceId} ${type} does not exist in place ${placeId}`);
    return false;
  }

  return true;
}

export async function updateDeviceState(
  placeId: string,
  deviceId: string,
  type: VirtualDeviceType,
  newState: boolean
): Promise<boolean> {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`updateDeviceState: place ${placeId} does not exist`);
    return false;
  }

  const devices = place.devices;

  let hasFound = false;
  for (const placeDevice of devices) {
    if (placeDevice.deviceId === deviceId && placeDevice.type === type) {
      const deviceModel = (await getDeviceModelFromDevicePrimitive(placeDevice)) as VirtualDeviceModelWrapper;
      if (deviceModel === null) {
        logger.warn(`updateDeviceState: device ${deviceId} ${type} does not exist`);
        return false;
      }
      deviceModel.device.state = newState;
      await deviceModel.device.save();
      hasFound = true;
      break;
    }
  }

  if (!hasFound) {
    logger.warn(`updateDeviceState: device ${deviceId} ${type} does not exist in place ${placeId}`);
    return false;
  }

  return true;
}

export async function updateDeviceValue(
  placeId: string,
  deviceId: string,
  type: VirtualDeviceType,
  newValue: number
): Promise<boolean> {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`updateDeviceValue: place ${placeId} does not exist`);
    return false;
  }

  const devices = place.devices;

  let hasFound = false;
  for (const placeDevice of devices) {
    if (placeDevice.deviceId === deviceId && placeDevice.type === type) {
      const deviceModel = (await getDeviceModelFromDevicePrimitive(placeDevice)) as VirtualDeviceModelWrapper;
      if (deviceModel === null) {
        logger.warn(`updateDeviceValue: device ${deviceId} ${type} does not exist`);
        return false;
      }
      deviceModel.device.value = newValue;
      await deviceModel.device.save();
      hasFound = true;
      break;
    }
  }

  if (!hasFound) {
    logger.warn(`updateDeviceValue: device ${deviceId} ${type} does not exist in place ${placeId}`);
    return false;
  }

  return true;
}

export async function removeDeviceFromPlace(placeId: string, deviceId: string, type: DeviceEnum): Promise<boolean> {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`removeDeviceFromPlace: place ${placeId} does not exist`);
    return false;
  }

  const devices = place.devices;

  let hasFound = false;
  for (let i = 0; i < devices.length; i++) {
    if (devices[i]!.deviceId === deviceId && devices[i]!.type === type) {
      devices.splice(i, 1);
      const position = await getPositionByDevice({ deviceId, type });
      if (position !== null) {
        await position.destroy();
      }
      hasFound = true;
      break;
    }
  }
  if (!hasFound) {
    logger.warn(`removeDeviceFromPlace: device ${deviceId} ${type} does not exist in place ${placeId}`);
    return false;
  }

  place.devices = devices;
  await place.save();
  return true;
}

export async function createVirtualDevice(deviceId: string, type: VirtualDeviceType, pos: DevicePosition) {
  const devicePrimitive: DevicePrimitive = {
    deviceId,
    type,
  };
  const device = await getDeviceModelFromDevicePrimitive(devicePrimitive);
  if (device !== null) {
    logger.warn(`createVirtualDevice: device ${deviceId} ${type} already exists`);
    return false;
  }

  createVirtualDeviceModelFromDevicePrimitive(devicePrimitive);

  await Position.create({
    deviceId,
    type,
    position: pos,
  });

  return device;
}

/**
 * @description This includes a call to removeDeviceFromPlace.
 */
export async function deleteVirtualDevice(placeId: string, deviceId: string, type: VirtualDeviceType) {
  const device: DevicePrimitive = { deviceId, type };
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`deleteVirtualDevice: place ${placeId} does not exist`);
    return false;
  }

  await removeDeviceFromPlace(placeId, deviceId, type);

  const deviceModel = await getDeviceModelFromDevicePrimitive(device);
  if (deviceModel === null) {
    logger.warn(`deleteVirtualDevice: device ${deviceId} does not exist`);
    return false;
  }

  const position = await getPositionByDevice(device);
  if (position) {
    await position.destroy();
  }

  await deviceModel.device.destroy();
  return true;
}

export async function deleteDevice(placeId: string, deviceId: string, type: DeviceEnum): Promise<boolean> {
  const place = await getPlaceById(placeId);
  if (place === null) {
    logger.warn(`deleteDevice: place ${placeId} does not exist`);
    return false;
  }

  if (type === DeviceEnum.CAMERA || type === DeviceEnum.RCLIENT) {
    return await removeDeviceFromPlace(placeId, deviceId, type);
  }

  return await deleteVirtualDevice(placeId, deviceId, type);
}
