// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { RemoteClient, RemoteCommand } = require("../../models");
const logger = require("../../../util/logger")("remote-control-api");
const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

// default to 4 hours. This is ok because when shared link expires, the password will be
// updated by the panel automatically.
let CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 1000 * 60;
if (CLASS_DURATION < 1000 * 60) {
  CLASS_DURATION = 1000 * 60;
}

/**
 * @typedef Directive
 * @prop {string} command
 * @prop {string} displayText
 */

/**
 * @param {string} clientId
 * @param {Directive} directive
 * @param {string[]} args
 */
async function createRemoteCommand(clientId, directive, args) {
  if ((await getRemoteClientById(clientId)) === null) {
    logger.warn(`createRemoteCommand: client not found, clientId: ${clientId}`);
    return null;
  }
  return await RemoteCommand.create({
    command: directive.command,
    displayText: directive.displayText,
    args: JSON.stringify(args),
    clientId,
  });
}

async function getRemoteCommands() {
  return await RemoteCommand.findAll();
}

/**
 * @param {string} clientId
 */
async function getRemoteCommandsByClientId(clientId) {
  return await RemoteCommand.findAll({ where: { clientId } });
}

/**
 * @param {string} clientId
 * @param {"running" | "finished" | "failed"} status
 */
async function getRemoteCommandsByClientIdAndStatus(clientId, status) {
  return await RemoteCommand.findAll({ where: { clientId, status } });
}

/**
 * @param {string} clientId
 * @param {number} commandId
 */
async function getRemoteCommandById(clientId, commandId) {
  return await RemoteCommand.findOne({ where: { clientId, commandId } });
}

/**
 * @param {string} clientId
 * @param {number} commandId
 * @param {"running" | "finished" | "failed"} status
 * @param {string | null} [reportedResult]
 */
async function setRemoteCommandStatus(clientId, commandId, status, reportedResult) {
  if (typeof reportedResult === "undefined") {
    reportedResult = null;
  }
  const results = await RemoteCommand.update({ status, reportedResult }, { where: { clientId, commandId } });
  if (results[0] === 0) {
    logger.error("no command found. client:", clientId, "command:", commandId, `(${status}, ${reportedResult})`);
    return false;
  }
  return true;
}

/**
 * @param {string} clientId
 * @param {Directive["command"]} commandType
 */
async function invalidateRemoteCommandByCommandType(clientId, commandType) {
  await RemoteCommand.update(
    {
      status: "failed",
      reportedResult: "invalidated by upcoming command of same commandType",
    },
    { where: { clientId, command: commandType } }
  );
}

/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 */
async function createRemoteClient(clientId, password, ip) {
  if ((await getRemoteClientById(clientId)) !== null) {
    logger.warn(`createRemoteClient: client already exists, clientId: ${clientId}`);
    return null;
  }
  await RemoteClient.create({
    clientId,
    password,
    passwordExpireAt: new Date(Date.now() - 1),
    ip,
  });
  return await RemoteClient.findByPk(clientId);
}

async function getRemoteClients() {
  return await RemoteClient.findAll();
}

/**
 * @param {string} clientId
 */
async function getRemoteClientById(clientId) {
  return await RemoteClient.findByPk(clientId);
}

/**
 * @param {string} clientId
 */
async function removeRemoteClientById(clientId) {
  const client = await getRemoteClientById(clientId);
  if (!client) {
    logger.warn(`removeRemoteClientById: cannot remove because client doesn't exist, clientId: ${clientId}`);
    return;
  }
  if (client.online === true) {
    logger.warn(`removing a client that is still online, clientId: ${clientId}`);
  }
  await client.destroy();
}

/**
 * @param {string} clientId
 * @param {string} password
 */
async function updateRClientPasswordById(clientId, password) {
  const client = await getRemoteClientById(clientId);
  if (client === null) {
    logger.warn(`updateRClientPasswordById: cannot update because client doesn't exist, clientId: ${clientId}`);
    return null;
  }
  await RemoteClient.update(
    {
      password,
      passwordExpireAt: new Date(Date.now() + CLASS_DURATION),
      nextPassword: null,
    },
    { where: { clientId } }
  );
  return await getRemoteClientById(clientId);
}

/**
 * @param {string} clientId
 */
async function invalidatePasswordById(clientId) {
  await RemoteClient.update({ passwordExpireAt: new Date(Date.now() - 1) }, { where: { clientId } });
  return await RemoteClient.findByPk(clientId);
}

/**
 * @param {string} clientId
 */
async function setActiveByRemoteClientId(clientId) {
  await RemoteClient.update({ lastActive: new Date() }, { where: { clientId } });
}

/**
 * @param {string} clientId
 * @returns {Promise<boolean>}
 */
async function isRemoteClientActive(clientId) {
  const client = await RemoteClient.findByPk(clientId);
  if (client === null) {
    return false;
  }
  return client.online;
}

module.exports = {
  createRemoteCommand,
  getRemoteCommands,
  getRemoteCommandById,
  getRemoteCommandsByClientId,
  getRemoteCommandsByClientIdAndStatus,
  setRemoteCommandStatus,
  invalidateRemoteCommandByCommandType,
  createRemoteClient,
  getRemoteClients,
  getRemoteClientById,
  removeRemoteClientById,
  updateRClientPasswordById,
  invalidatePasswordById,
  setActiveByRemoteClientId,
  isRemoteClientActive,
};
