// @ts-check

const assert = require("assert");

const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { RemoteClient } = require("../../models");

// default to 4 hours. This is ok because when shared link expires, the password will be
// updated by the panel automatically.
let CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 1000 * 60;
if (CLASS_DURATION < 1000 * 60) {
  CLASS_DURATION = 1000 * 60;
}

/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 * @param {boolean} isActive
 */
async function createRemoteClient(clientId, password, ip, isActive) {
  await RemoteClient.create({
    clientId,
    password,
    passwordExpireAt: Date.now() - 1,
    ip,
    lastActive: isActive ? Date.now() : null,
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
 * @param {string} password
 */
async function updatePasswordById(clientId, password) {
  await RemoteClient.update(
    {
      password,
      passwordExpireAt: Date.now() + CLASS_DURATION,
    },
    { where: { clientId } }
  );
  return await RemoteClient.findByPk(clientId);
}

async function invalidatePasswordById(clientId) {
  await RemoteClient.update({ passwordExpireAt: Date.now() - 1 }, { where: { clientId } });
  return await RemoteClient.findByPk(clientId);
}

/**
 * @param {string} clientId
 */
async function setActiveById(clientId) {
  await RemoteClient.update({ lastActive: new Date() }, { where: { clientId } });
  return await RemoteClient.findByPk(clientId);
}

/**
 * @param {string} clientId
 * @returns {Promise<boolean>}
 */
async function isActive(clientId) {
  const client = await RemoteClient.findByPk(clientId);
  if (client === null) {
    return false;
  }
  return client.online;
}

module.exports = {
  createRemoteClient,
  getRemoteClients,
  getRemoteClientById,
  updatePasswordById,
  invalidatePasswordById,
  setActiveById,
  isActive,
};
