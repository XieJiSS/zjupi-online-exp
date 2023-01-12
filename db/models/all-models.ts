/** @format */

import Session from "./Session"; // will be used by express-session
import RemoteClient from "./RemoteClient";
import RemoteCommand from "./RemoteCommand";
import Camera from "./Camera";
import DoorLock from "./DoorLock";
import Lamp from "./Lamp";
import Sensor from "./Sensor";
import Switch from "./Switch";
import Place from "./Place";
import Position from "./Position";
import Admin from "./Admin";
import Student from "./Student";
import AccessLink from "./AccessLink";
import DBLog from "./DBLog";

import _ from "../constraints";

// we are not exporting Session here because it shouldn't be manipulated by hand
export { default as RemoteClient } from "./RemoteClient";
export type { RemoteClientModelCtor, RemoteClientModel } from "./RemoteClient";
export { default as RemoteCommand } from "./RemoteCommand";
export type { RemoteCommandModelCtor, RemoteCommandModel, REMOTE_CMD_STATE } from "./RemoteCommand";
export { default as Camera } from "./Camera";
export type { CameraModelCtor, CameraModel } from "./Camera";
export { default as DoorLock } from "./DoorLock";
export type { DoorLockModelCtor, DoorLockModel } from "./DoorLock";
export { default as Lamp } from "./Lamp";
export type { LampModelCtor, LampModel } from "./Lamp";
export { default as Sensor } from "./Sensor";
export type { SensorModelCtor, SensorModel } from "./Sensor";
export { default as Switch } from "./Switch";
export type { SwitchModelCtor, SwitchModel } from "./Switch";
export { default as Place } from "./Place";
export type { PlaceModelCtor, PlaceModel } from "./Place";
export { default as Position } from "./Position";
export type { PositionModelCtor, PositionModel } from "./Position";

export { default as Admin } from "./Admin";
export type { AdminModelCtor, AdminModel } from "./Admin";
export { default as Student } from "./Student";
export type { StudentModelCtor, StudentModel } from "./Student";
export { default as AccessLink } from "./AccessLink";
export type { AccessLinkModelCtor, AccessLinkModel } from "./AccessLink";
export { default as DBLog } from "./DBLog";
export type { DBLogModelCtor, DBLogModel } from "./DBLog";

// Models in former arrays will be synced first. Sync order in the same array is not guaranteed.
// This is mainly used to avoid alter failures caused by associations between Models, as specified
// in ./constraints.ts.
export const topoSortedModels = [
  [Session],
  [RemoteClient, RemoteCommand, Camera, DoorLock, Lamp, Sensor, Switch, Place, Admin, Student, DBLog],
  [Position, AccessLink],
];
