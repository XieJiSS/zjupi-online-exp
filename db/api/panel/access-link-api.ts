/** @format */

import assert from "assert";
import { hasAuthed } from "../../connect";
assert(hasAuthed());

import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "../../../types/type-helper";

import getLogger from "../../../util/logger";
import { getPersistentLoggerUtil } from "../db-log-api";
const logger = getLogger("access-link-api");
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import { Op } from "sequelize";
import { AccessLink, RemoteClient, Student } from "../../models/all-models";
import type { AccessLinkModel } from "../../models/all-models";

function generateLinkPath() {
  const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 8;
  let result = "";
  while (result.length < length) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

export interface AccessLinkValidTimeOptions {
  validAfter?: Date;
  validUntil?: Date;
}
async function createAccessLink(clientId: string, options: Required<AccessLinkValidTimeOptions>) {
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
    logger.error(`createAccessLink: client ${clientId} not found`);
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

async function removeAccessLink(linkId: number) {
  const link = await getLinkById(linkId);
  if (!link) {
    return false;
  }
  logger.info(`Removing access link ${linkId} from database...`);
  await Promise.all([_removeLinkFromRemoteClient(linkId), removeLinkFromStudent(linkId)]);
  return (await AccessLink.destroy({ where: { linkId } }))[0] > 0;
}

async function assignCameraToLink(cameraId: string, linkId: number) {
  return (await AccessLink.update({ cameraId }, { where: { linkId } }))[0] > 0;
}

async function removeCameraFromLink(linkId: number) {
  return (await AccessLink.update({ cameraId: null }, { where: { linkId } }))[0] > 0;
}

/**
 * @description assign a link to a remote client, while removing the link from the previous client
 */
async function assignLinkToRemoteClient(linkId: number, clientId: string) {
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
 * @private
 * @description remove the link from the remote client that it is assigned to. For internal use only.
 */
async function _removeLinkFromRemoteClient(linkId: number) {
  const link = await getLinkById(linkId);
  if (!link) {
    return false;
  }
  return (await RemoteClient.update({ linkId: null }, { where: { linkId } }))[0] > 0;
}

async function assignLinkToStudent(linkId: number, studentId: number) {
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

async function removeLinkFromStudent(linkId: number) {
  return (await Student.update({ linkId: null }, { where: { linkId } }))[0] > 0;
}

async function getLinkById(linkId: number) {
  return await AccessLink.findOne({ where: { linkId } });
}

async function getLinkByIdAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(
  linkId: number,
  attributes: Readonly<T[]>
): Promise<TPartialModel<AccessLinkModel, T> | null> {
  return (await AccessLink.findOne({
    where: { linkId },
    attributes: attributes as T[],
  })) as TPartialModel<AccessLinkModel, T>;
}

async function getLinkByLinkPath(linkPath: string) {
  return await AccessLink.findOne({ where: { linkPath } });
}

async function getAllLinks() {
  return await AccessLink.findAll();
}

async function getAllLinksAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(
  attributes: Readonly<T[]>
): Promise<TPartialModelArr<AccessLinkModel, T>> {
  return (await AccessLink.findAll({
    attributes: attributes as T[],
  })) as TPartialModelArr<AccessLinkModel, T>;
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

async function getAllValidLinksAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(
  attributes: Readonly<T[]>
): Promise<TPartialModelArr<AccessLinkModel, T>> {
  return (await AccessLink.findAll({
    where: {
      validUntil: {
        [Op.gt]: new Date(),
      },
      validAfter: {
        [Op.lt]: new Date(),
      },
    },
    attributes: attributes as T[],
  })) as TPartialModelArr<AccessLinkModel, T>;
}

async function getLinkIfValidByLinkPath(linkPath: string) {
  const link = await getLinkByLinkPath(linkPath);
  if (!link) {
    logger.warn(`getLinkIfValidByLinkPath: link ${linkPath} not found`);
    return null;
  }
  return link.isValid ? link : null;
}

async function invalidateLinkById(linkId: number) {
  return (await AccessLink.update({ validUntil: new Date() }, { where: { linkId } }))[0] > 0;
}

async function invalidateLinkByLinkPath(linkPath: string) {
  return (await AccessLink.update({ validUntil: new Date() }, { where: { linkPath } }))[0] > 0;
}

async function revalidateLinkById(linkId: number, validUntil: Date) {
  const result = await AccessLink.update(
    {
      validAfter: new Date(),
      validUntil,
    },
    { where: { linkId } }
  );
  return result[0] > 0;
}

async function setValidTimeById(linkId: number, options: AccessLinkValidTimeOptions) {
  return (await AccessLink.update({ ...options }, { where: { linkId } }))[0] > 0;
}

export default {
  createAccessLink,
  removeAccessLink,
  assignCameraToLink,
  removeCameraFromLink,
  assignLinkToStudent,
  removeLinkFromStudent,
  assignLinkToRemoteClient,
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
