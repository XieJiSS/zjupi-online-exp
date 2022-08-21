// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Op } = require("sequelize");

const { AccessLink } = require("../../models");
const logger = require("../../../util/logger")("access-link-api");

const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

/**
 * @param {string} link
 * @param {Date} validateUntil
 * @param {string} clientId
 */
async function createAccessLink(link, validateUntil, clientId) {
  if (await getLinkObjByLink(link)) {
    return null;
  }
  return await AccessLink.create({
    link,
    validateUntil,
    clientId,
  });
}

/**
 * @param {number} linkId
 * @param {string} cameraId
 */
async function assignCameraToLink(linkId, cameraId) {
  return (await AccessLink.update({ cameraId }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {number} linkId
 */
async function removeCameraFromLink(linkId) {
  return (await AccessLink.update({ cameraId: null }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {number} linkId
 */
async function getLinkObjById(linkId) {
  return await AccessLink.findOne({ where: { linkId } });
}

/**
 * @param {string} link
 */
async function getLinkObjByLink(link) {
  return await AccessLink.findOne({ where: { link } });
}

async function getAllLinks() {
  return await AccessLink.findAll();
}

async function getAllValidLinks() {
  return await AccessLink.findAll({
    where: {
      validateUntil: {
        [Op.gt]: new Date(),
      },
    },
  });
}

/**
 * @param {string} link
 */
async function getValidLink(link) {
  const linkObj = await getLinkObjByLink(link);
  if (!linkObj) {
    return null;
  }
  return linkObj.isValid ? linkObj : null;
}

/**
 * @param {number} linkId
 */
async function invalidateLinkById(linkId) {
  return (await AccessLink.update({ validateUntil: new Date() }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {string} link
 */
async function invalidateLinkByLink(link) {
  return (await AccessLink.update({ validateUntil: new Date() }, { where: { link } }))[0] > 0;
}

module.exports = {
  createAccessLink,
  assignCameraToLink,
  removeCameraFromLink,
  getLinkObjById,
  getLinkObjByLink,
  getValidLink,
  getAllLinks,
  getAllValidLinks,
  invalidateLinkById,
  invalidateLinkByLink,
};
