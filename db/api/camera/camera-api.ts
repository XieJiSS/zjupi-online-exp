import assert from "assert";
import { hasAuthed } from "db/connect";
assert(hasAuthed());

import { Camera, AccessLink } from "db/models/all-models";
import type { CameraModelCtor } from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly, TMarkPartialAttrs } from "types/type-helper";
import type { CameraReportErrorReqBody } from "camera/camera-server";

import getLogger from "util/logger";
import { createDBLog, getPersistentLoggerUtil } from "db/api/db-log-api";
const logger = getLogger("camera-api");
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

async function getCameraById(cameraId: string) {
  return await Camera.findOne({ where: { cameraId } });
}

async function getCameraByIdAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(
  cameraId: string,
  attributes: Readonly<T[]>
): Promise<TModelAttrsOnly<CameraModelCtor, T>> {
  return (await Camera.findOne({
    where: { cameraId },
    attributes: attributes as T[],
  })) as TModelAttrsOnly<CameraModelCtor, T>;
}

async function createCamera(cameraId: string, ip: string) {
  if ((await getCameraById(cameraId)) !== null) {
    logger.warn(`createCamera: camera ${cameraId} already exists`);
    return null;
  }
  return await Camera.create({
    cameraId,
    ip,
    lastActive: new Date(),
  });
}

async function isCameraOnline(cameraId: string) {
  const camera = await getCameraById(cameraId);
  return camera !== null && camera.online;
}

async function getAllCameras() {
  return await Camera.findAll();
}

async function getAllCamerasAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(
  attributes: Readonly<T[]>
): Promise<TModelListAttrsOnly<CameraModelCtor, T>> {
  return (await Camera.findAll({
    attributes: attributes as T[],
  })) as TModelListAttrsOnly<CameraModelCtor, T>;
}

async function getAllOnlineCameras() {
  return await Camera.findAll({ where: { online: true } });
}

async function getAllOnlineCamerasAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(
  attributes: Readonly<T[]>
): Promise<TModelListAttrsOnly<CameraModelCtor, T>> {
  return (await Camera.findAll({
    where: { online: true },
    attributes: attributes as T[],
  })) as TModelListAttrsOnly<CameraModelCtor, T>;
}

async function appendCameraErrorReport(
  cameraId: string,
  error: TMarkPartialAttrs<CameraReportErrorReqBody, "cameraId">
) {
  const camera = await getCameraById(cameraId);
  if (camera === null) {
    logger.warn(`appendErrorReport: cannot append error because camera ${cameraId} doesn't exist`);
    return;
  }
  // store error log into database
  error.cameraId = cameraId;
  await createDBLog("error", JSON.stringify(error, null, 2), __filename);

  // only keep the last 10 errors
  const errors = camera.reportedErrors.slice(-10);
  errors.push(JSON.stringify(error));
  await camera.update({ reportedErrors: errors });
}

/**
 * @param {string} cameraId
 */
async function removeCamera(cameraId: string) {
  const camera = await getCameraById(cameraId);
  if (camera === null) {
    logger.warn(`removeCamera: cannot remove because camera ${cameraId} doesn't exist`);
    return;
  }
  await AccessLink.update({ cameraId: null }, { where: { cameraId } });
  return await camera.destroy();
}

/**
 * @param {string} cameraId
 */
async function setActiveByCameraId(cameraId: string) {
  await Camera.update({ lastActive: new Date() }, { where: { cameraId } });
}

export = {
  getCameraById,
  getCameraByIdAttrsOnly,
  createCamera,
  isCameraOnline,
  getAllCameras,
  getAllCamerasAttrsOnly,
  getAllOnlineCameras,
  getAllOnlineCamerasAttrsOnly,
  appendCameraErrorReport,
  removeCamera,
  setActiveByCameraId,
};
