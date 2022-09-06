// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Camera, AccessLink } = require("../../models/all-models");

/**
 * @template T
 * @typedef {T extends import("sequelize").ModelCtor<infer I> ? I : never} TModelType
 */
/**
 * @template U
 * @typedef {U extends import("sequelize").Model<infer I, infer _> ? I : never} TModelAttributesType
 */
/**
 * @template V
 * @typedef {keyof TModelAttributesType<TModelType<V>>} TModelKey
 */

const logger = require("../../../util/logger")("camera-api");
const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

/**
 * @param {string} cameraId
 */
async function getCameraById(cameraId) {
  return await Camera.findOne({ where: { cameraId } });
}

/**
 * @param {string} cameraId
 * @param {TModelKey<typeof Camera>[]} attributes
 */
async function getCameraByIdAttrsOnly(cameraId, attributes) {
  return await Camera.findOne({ where: { cameraId }, attributes });
}

/**
 * @param {string} cameraId
 * @param {string} ip
 */
async function createCamera(cameraId, ip) {
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

/**
 * @param {string} cameraId
 */
async function isCameraOnline(cameraId) {
  const camera = await getCameraById(cameraId);
  return camera !== null && camera.online;
}

async function getAllCameras() {
  return await Camera.findAll();
}

/**
 * @param {TModelKey<typeof Camera>[]} attributes
 */
async function getAllCamerasAttrsOnly(attributes) {
  return await Camera.findAll({ attributes });
}

async function getAllOnlineCameras() {
  return await Camera.findAll({ where: { online: true } });
}

/**
 * @param {TModelKey<typeof Camera>[]} attributes
 */
async function getAllOnlineCamerasAttrsOnly(attributes) {
  return await Camera.findAll({ where: { online: true }, attributes });
}

/**
 * @param {string} cameraId
 */
async function removeCamera(cameraId) {
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
async function setActiveByCameraId(cameraId) {
  await Camera.update({ lastActive: new Date() }, { where: { cameraId } });
}

module.exports = {
  getCameraById,
  getCameraByIdAttrsOnly,
  createCamera,
  isCameraOnline,
  getAllCameras,
  getAllCamerasAttrsOnly,
  getAllOnlineCameras,
  getAllOnlineCamerasAttrsOnly,
  removeCamera,
  setActiveByCameraId,
};
