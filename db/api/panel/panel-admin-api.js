// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const crypto = require("crypto");
const { promisify } = require("util");
const pbkdf2 = promisify(crypto.pbkdf2);

const { Admin } = require("../../models");
const logger = require("../../../util/logger")("panel-admin-api");

const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

/**
 * @param {string} password
 * @param {string} salt
 */
async function _getPBKDF2Hash(password, salt) {
  const iterations = 10000;
  const keyLen = 64;
  return (await pbkdf2(password, salt, iterations, keyLen, "sha512")).toString("base64");
}

/**
 * @description PBKDF sha512
 * @param {string} password
 * @typedef SaltHashPair
 * @prop {string} hash
 * @prop {string} salt
 * @return {Promise<SaltHashPair>}
 */
async function _generateSaltHashPair(password) {
  const salt = crypto.randomBytes(64).toString("base64");
  const hash = await _getPBKDF2Hash(password, salt);
  return { hash, salt };
}

/**
 * @param {string} username
 */
async function getAdminByUsername(username) {
  return await Admin.findOne({ where: { username } });
}

/**
 * @param {number} adminId
 */
async function getAdminById(adminId) {
  return await Admin.findByPk(adminId);
}

/**
 * @param {string} username
 * @param {string} password
 */
async function createAdmin(username, password) {
  if ((await getAdminByUsername(username)) !== null) {
    logger.warn("admin username already exists:", username);
    return null;
  }
  const { hash, salt } = await _generateSaltHashPair(password);
  return await Admin.create({
    username,
    hash,
    salt,
  });
}

/**
 * @param {number} adminId
 * @param {string} session
 */
async function updateAdminSession(adminId, session) {
  return await Admin.update({ session }, { where: { adminId } });
}

/**
 * @param {number} adminId
 * @param {string} session
 */
async function isValidAdminSession(adminId, session) {
  const admin = await getAdminById(adminId);
  if (admin === null) {
    return false;
  }
  return admin.session === session;
}

/**
 * @param {string} username
 * @param {string} password
 */
async function isValidAdminCredentials(username, password) {
  const admin = await getAdminByUsername(username);
  if (admin === null) {
    return false;
  }
  const { hash, salt } = admin;
  const hash2 = await _getPBKDF2Hash(password, salt);
  return hash === hash2;
}

/**
 * @param {number} adminId
 */
async function removeAdminSessionById(adminId) {
  return await Admin.update({ session: null }, { where: { adminId } });
}

/**
 * @param {string} session
 */
async function removeAdminSessionBySession(session) {
  return await Admin.update({ session: null }, { where: { session } });
}

/**
 * @param {number} adminId
 * @param {string} password
 */
async function changeAdminPassword(adminId, password) {
  const { hash, salt } = await _generateSaltHashPair(password);
  return await Admin.update({ hash, salt, session: null }, { where: { adminId } });
}

module.exports = {
  getAdminById,
  getAdminByUsername,
  createAdmin,
  updateAdminSession,
  isValidAdminCredentials,
  isValidAdminSession,
  removeAdminSessionById,
  removeAdminSessionBySession,
  changeAdminPassword,
};
