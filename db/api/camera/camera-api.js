// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Camera } = require("../../models");
const logger = require("../../../util/logger")("camera-api");
const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

/**
 * @param {string} cameraId
 */
async function getCameraByCameraId(cameraId) {
  return await Camera.findOne({ where: { cameraId } });
}

/**
 * @param {string} cameraId
 * @param {string} ip
 */
async function createCamera(cameraId, ip) {
  if ((await getCameraByCameraId(cameraId)) !== null) {
    logger.warn(`createCamera: camera ${cameraId} already exists`);
    return null;
  }
  return await Camera.create({
    cameraId,
    ip,
  });
}

/**
 * @param {string} cameraId
 */
async function isCameraOnline(cameraId) {
  const camera = await getCameraByCameraId(cameraId);
  return camera !== null && camera.online;
}

async function getAllCameras() {
  return await Camera.findAll();
}

async function getAllOnlineCameras() {
  return await Camera.findAll({ where: { online: true } });
}

/**
 * @param {string} cameraId
 */
async function removeCamera(cameraId) {
  const camera = await getCameraByCameraId(cameraId);
  if (camera === null) {
    logger.warn(`removeCamera: cannot remove because camera ${cameraId} doesn't exist`);
    return;
  }
  return await camera.destroy();
}

/**
 * @param {string} cameraId
 */
async function setActiveByCameraId(cameraId) {
  await Camera.update({ lastActive: new Date() }, { where: { cameraId } });
}

module.exports = {
  getCameraByCameraId,
  createCamera,
  isCameraOnline,
  getAllCameras,
  getAllOnlineCameras,
  removeCamera,
  setActiveByCameraId,
};
