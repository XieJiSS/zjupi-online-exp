import Session from "./Session"; // will be used by express-session
import RemoteClient from "./RemoteClient";
import RemoteCommand from "./RemoteCommand";
import Camera from "./Camera";
import Admin from "./Admin";
import Student from "./Student";
import AccessLink from "./AccessLink";
import DBLog from "./DBLog";

import _ from "db/constraints";

// we are not exporting Session here because it shouldn't be manipulated by hand
export { default as RemoteClient } from "./RemoteClient";
export type { RemoteClientModelCtor } from "./RemoteClient";
export { default as RemoteCommand } from "./RemoteCommand";
export type { RemoteCommandModelCtor } from "./RemoteCommand";
export { default as Camera } from "./Camera";
export type { CameraModelCtor } from "./Camera";
export { default as Admin } from "./Admin";
export type { AdminModelCtor } from "./Admin";
export { default as Student } from "./Student";
export type { StudentModelCtor } from "./Student";
export { default as AccessLink } from "./AccessLink";
export type { AccessLinkModelCtor } from "./AccessLink";
export { default as DBLog } from "./DBLog";
export type { DBLogModelCtor } from "./DBLog";

// Models in former arrays will be synced first. Sync order in the same array is not guaranteed.
// This is mainly used to avoid alter failures caused by associations between Models, as specified
// in ./constraints.ts.
export const topoSortedModels = [[Session], [RemoteClient, RemoteCommand, Camera, Admin, Student, DBLog], [AccessLink]];
