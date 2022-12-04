/** @format */

import assert from "assert";
import { hasAuthed } from "../../connect";
assert(hasAuthed());

import { Op } from "sequelize";

import { RemoteClient, RemoteCommand, AccessLink } from "../../models/all-models";
import type { RemoteClientModel, AccessLinkModel, REMOTE_CMD_STATE } from "../../models/all-models";
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "../../../types/type-helper";

import getLogger from "../../../util/logger";
const logger = getLogger("remote-control-api");

import { getPersistentLoggerUtil } from "../db-log-api";
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

// default to 4 hours. This is ok because when shared link expires, the password will be
// updated by the panel automatically.
let CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 1000 * 60;
if (CLASS_DURATION < 1000 * 60) {
  CLASS_DURATION = 1000 * 60;
}

function generateRandomClientId() {
  // 100000000 - 199999999
  return Math.floor(Math.random() * 100000000 + 100000000).toString();
}

export interface RemoteControlDirective {
  command: string;
  explanation: string;
}

async function createRemoteCommand(
  clientId: string,
  directive: RemoteControlDirective,
  args?: string[],
  status: REMOTE_CMD_STATE = "queued"
) {
  if (!args) {
    args = [];
  }
  if ((await getRemoteClientById(clientId)) === null) {
    logger.warn(`createRemoteCommand: client not found, clientId: ${clientId}`);
    return null;
  }
  return await RemoteCommand.create({
    command: directive.command,
    explanation: directive.explanation,
    args: JSON.stringify(args),
    clientId,
    status,
  });
}

async function getAllRemoteCommands() {
  return await RemoteCommand.findAll();
}

async function getRemoteCommandsByClientId(clientId: string) {
  return await RemoteCommand.findAll({ where: { clientId } });
}

async function getRemoteCommandsByClientIdAndStatus(clientId: string, statusList: REMOTE_CMD_STATE[]) {
  return await RemoteCommand.findAll({
    where: {
      clientId,
      status: {
        [Op.or]: statusList,
      },
    },
  });
}

async function getRemoteCommandByIds(clientId: string, commandId: number) {
  return await RemoteCommand.findOne({ where: { clientId, commandId } });
}

async function setRemoteCommandStatus(
  clientId: string,
  commandId: number,
  status: REMOTE_CMD_STATE,
  reportedResult?: string | null
) {
  if (typeof reportedResult === "undefined") {
    reportedResult = null;
  }
  let results: [number];
  switch (status) {
    case "queued":
      logger.error(
        `setRemoteCommandStatus: should not set status to queued, clientId: ${clientId}, commandId: ${commandId}`
      );
      return false;
    case "running":
      results = await RemoteCommand.update(
        {
          status,
          executingAt: new Date(),
        },
        { where: { clientId, commandId } }
      );
      break;
    case "finished":
    case "failed": // [fallthrough]
      results = await RemoteCommand.update(
        {
          status,
          reportedResult,
          reportedAt: new Date(),
        },
        { where: { clientId, commandId } }
      );
      break;
    default:
      logger.error(`setRemoteCommandStatus: unknown status: ${status}`);
      return false;
  }
  if (results[0] === 0) {
    logger.error("no command found. client:", clientId, "command:", commandId, `(${status}, ${reportedResult})`);
    return false;
  }
  return true;
}

async function invalidateRemoteCommandByCommandType(clientId: string, commandType: RemoteControlDirective["command"]) {
  await RemoteCommand.update(
    {
      status: "failed",
      reportedResult: "command invalidated, probably due to upcoming command of same commandType",
    },
    { where: { clientId, command: commandType } }
  );
}

/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 */
async function createRemoteClient(clientId: string, password: string, ip: string) {
  if ((await getRemoteClientById(clientId)) !== null) {
    logger.warn(`createRemoteClient: client already exists, clientId: ${clientId}`);
    return null;
  }
  await RemoteClient.create({
    clientId,
    password,
    lastActive: new Date(),
    passwordExpireAt: new Date(Date.now() - 1),
    ip,
  });
  return await RemoteClient.findByPk(clientId);
}

async function getAllRemoteClients() {
  return await RemoteClient.findAll();
}

async function getAllRemoteClientsAttrsOnly<T extends TExtractAttrsFromModel<RemoteClientModel>>(
  attributes: Readonly<T[]>
): Promise<TPartialModelArr<RemoteClientModel, T>> {
  return (await RemoteClient.findAll({
    attributes: attributes as T[],
  })) as TPartialModelArr<RemoteClientModel, T>;
}

type TRemoteClientWithLink = RemoteClientModel & { link: AccessLinkModel };

async function getAllRemoteClientsWithLinks() {
  return (await RemoteClient.findAll({
    include: {
      model: AccessLink,
      as: "link",
    },
  })) as TRemoteClientWithLink[];
}

async function getRemoteClientById(clientId: string) {
  return await RemoteClient.findByPk(clientId);
}

async function getRemoteClientByIdAttrsOnly<T extends TExtractAttrsFromModel<RemoteClientModel>>(
  clientId: string,
  attributes: Readonly<T[]>
): Promise<TPartialModel<RemoteClientModel, T> | null> {
  return (await RemoteClient.findByPk(clientId, {
    attributes: attributes as T[],
  })) as TPartialModel<RemoteClientModel, T>;
}

async function removeRemoteClientById(clientId: string) {
  const client = await getRemoteClientById(clientId);
  if (!client) {
    logger.warn(`removeRemoteClientById: cannot remove because client doesn't exist, clientId: ${clientId}`);
    return;
  }
  if (client.online === true) {
    logger.warn(`removing a client that is still online, clientId: ${clientId}`);
  }
  const commands = await getRemoteCommandsByClientId(clientId);
  for (const command of commands) {
    await command.update({ status: "failed", reportedResult: "client is offline for too long" });
  }
  await client.destroy();
}

async function setRemoteClientPasswordById(clientId: string, password: string, validDuration = CLASS_DURATION) {
  const client = await getRemoteClientById(clientId);
  if (client === null) {
    logger.warn(`setRemoteClientPasswordById: cannot update because client doesn't exist, clientId: ${clientId}`);
    return null;
  }
  await RemoteClient.update(
    {
      password,
      passwordExpireAt: new Date(Date.now() + validDuration),
    },
    { where: { clientId } }
  );
  return await getRemoteClientById(clientId);
}

async function invalidatePasswordById(clientId: string) {
  await RemoteClient.update({ passwordExpireAt: new Date(Date.now() - 1) }, { where: { clientId } });
  return await RemoteClient.findByPk(clientId);
}

async function setActiveByRemoteClientId(clientId: string) {
  await RemoteClient.update({ lastActive: new Date() }, { where: { clientId } });
}

async function isRemoteClientActive(clientId: string): Promise<boolean> {
  const client = await RemoteClient.findByPk(clientId);
  if (client === null) {
    return false;
  }
  return client.online;
}

export default {
  generateRandomClientId,
  createRemoteCommand,
  getAllRemoteCommands,
  getRemoteCommandByIds,
  getRemoteCommandsByClientId,
  getRemoteCommandsByClientIdAndStatus,
  setRemoteCommandStatus,
  invalidateRemoteCommandByCommandType,
  createRemoteClient,
  getAllRemoteClients,
  getAllRemoteClientsAttrsOnly,
  getAllRemoteClientsWithLinks,
  getRemoteClientById,
  getRemoteClientByIdAttrsOnly,
  removeRemoteClientById,
  setRemoteClientPasswordById,
  invalidatePasswordById,
  setActiveByRemoteClientId,
  isRemoteClientActive,
};
