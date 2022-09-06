// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Op } = require("sequelize");

const { AccessLink, RemoteClient, Student } = require("../../models/all-models");

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

const logger = require("../../../util/logger")("access-link-api");
const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

function generateLinkPath() {
  const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 8;
  let result = "";
  while (result.length < length) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

/**
 * @typedef AccessLinkValidTimeOptions
 * @prop {Date} [validAfter]
 * @prop {Date} [validUntil]
 */

/**
 * @param {string} clientId
 * @param {Required<AccessLinkValidTimeOptions>} options
 */
async function createAccessLink(clientId, options) {
  const { validAfter, validUntil } = options;
  if (validAfter > validUntil) {
    logger.error("createAccessLink: validAfter > validUntil");
    return null;
  }
  let tryCount = 1;
  let linkPath = generateLinkPath();
  while (await getLinkByLinkPath(linkPath)) {
    if (tryCount > 10) {
      logger.error("createAccessLink: Failed to generate a unique link path after 10 tries");
      return null;
    }
    linkPath = generateLinkPath();
    tryCount++;
  }
  const client = await RemoteClient.findOne({ where: { clientId } });
  if (!client) {
    return null;
  }
  const link = await AccessLink.create({
    linkPath,
    validAfter,
    validUntil,
    clientId,
    createdAt: new Date(),
  });
  await RemoteClient.update({ linkId: link.linkId }, { where: { clientId } });
  return link;
}

/**
 * @param {number} linkId
 */
async function removeAccessLink(linkId) {
  const link = await getLinkById(linkId);
  if (!link) {
    return null;
  }
  logger.info(`Removing access link ${linkId} from database...`);
  await Promise.all([removeLinkFromRemoteClient(linkId), removeLinkFromStudent(linkId)]);
  return (await AccessLink.destroy({ where: { linkId } }))[0] > 0;
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
 * @description assign a link to a remote client, while removing the link from the previous client
 * @param {number} linkId
 * @param {string} clientId
 */
async function assignLinkToRemoteClient(linkId, clientId) {
  const link = await getLinkById(linkId);
  if (!link) {
    return false;
  }
  const client = await RemoteClient.findOne({ where: { clientId } });
  if (!client) {
    return false;
  }
  const oldClient = await RemoteClient.findOne({ where: { linkId } });
  if (oldClient) {
    await RemoteClient.update({ linkId: null }, { where: { linkId } });
  }
  await link.update({ clientId });
  return (await RemoteClient.update({ linkId }, { where: { clientId } }))[0] > 0;
}

/**
 * @param {number} linkId
 */
async function removeLinkFromRemoteClient(linkId) {
  const link = await getLinkById(linkId);
  if (!link) {
    return false;
  }
  await link.update({ clientId: null });
  return (await RemoteClient.update({ linkId: null }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {number} linkId
 * @param {number} studentId
 */
async function assignLinkToStudent(linkId, studentId) {
  await removeLinkFromStudent(linkId);
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    logger.error(`assignLinkToStudent: student ${studentId} not found`);
    return false;
  }
  // since Link does not hold a reference to Student, there's no need to update the link instance
  // specified by student.linkId, i.e. we can update the student instance directly
  return (await Student.update({ linkId }, { where: { studentId } }))[0] > 0;
}

/**
 * @param {number} linkId
 */
async function removeLinkFromStudent(linkId) {
  return (await Student.update({ linkId: null }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {number} linkId
 */
async function getLinkById(linkId) {
  return await AccessLink.findOne({ where: { linkId } });
}

/**
 * @param {number} linkId
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
async function getLinkByIdAttrsOnly(linkId, attributes) {
  return await AccessLink.findOne({ where: { linkId }, attributes });
}

/**
 * @param {string} linkPath
 */
async function getLinkByLinkPath(linkPath) {
  return await AccessLink.findOne({ where: { linkPath } });
}

async function getAllLinks() {
  return await AccessLink.findAll();
}

/**
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
async function getAllLinksAttrsOnly(attributes) {
  return await AccessLink.findAll({ attributes });
}

async function getAllValidLinks() {
  return await AccessLink.findAll({
    where: {
      validUntil: {
        [Op.gt]: new Date(),
      },
      validAfter: {
        [Op.lt]: new Date(),
      },
    },
  });
}

/**
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
async function getAllValidLinksAttrsOnly(attributes) {
  return await AccessLink.findAll({
    where: {
      validUntil: {
        [Op.gt]: new Date(),
      },
      validAfter: {
        [Op.lt]: new Date(),
      },
    },
    attributes,
  });
}

/**
 * @param {string} linkPath
 */
async function getLinkIfValidByLinkPath(linkPath) {
  const link = await getLinkByLinkPath(linkPath);
  if (!link) {
    return null;
  }
  return link.isValid ? link : null;
}

/**
 * @param {number} linkId
 */
async function invalidateLinkById(linkId) {
  return (await AccessLink.update({ validUntil: new Date() }, { where: { linkId } }))[0] > 0;
}

/**
 * @param {string} linkPath
 */
async function invalidateLinkByLinkPath(linkPath) {
  return (await AccessLink.update({ validUntil: new Date() }, { where: { linkPath } }))[0] > 0;
}

/**
 * @param {number} linkId
 * @param {Date} validUntil
 */
async function revalidateLinkById(linkId, validUntil) {
  const result = await AccessLink.update(
    {
      validAfter: new Date(),
      validUntil,
    },
    { where: { linkId } }
  );
  return result[0] > 0;
}

/**
 * @param {number} linkId
 * @param {AccessLinkValidTimeOptions} options
 */
async function setValidTimeById(linkId, options) {
  return (await AccessLink.update({ ...options }, { where: { linkId } }))[0] > 0;
}

module.exports = {
  createAccessLink,
  removeAccessLink,
  assignCameraToLink,
  removeCameraFromLink,
  assignLinkToStudent,
  removeLinkFromStudent,
  assignLinkToRemoteClient,
  removeLinkFromRemoteClient,
  getLinkById,
  getLinkByIdAttrsOnly,
  getLinkByLinkPath,
  getLinkIfValidByLinkPath,
  getAllLinks,
  getAllLinksAttrsOnly,
  getAllValidLinks,
  getAllValidLinksAttrsOnly,
  invalidateLinkById,
  invalidateLinkByLinkPath,
  revalidateLinkById,
  setValidTimeById,
};
