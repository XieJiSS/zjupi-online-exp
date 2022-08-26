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

async function getAdminCount() {
  return await Admin.count();
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
  logger.info("createAdmin: username", username);
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
 * @param {string} password
 */
async function changeAdminPassword(adminId, password) {
  const { hash, salt } = await _generateSaltHashPair(password);
  const result = await Admin.update({ hash, salt }, { where: { adminId } });
  if (result[0] > 0) {
    logger.warn("changeAdminPassword: admin", adminId, "'s password has been changed");
  } else {
    logger.error("changeAdminPassword: admin", adminId, "not found");
  }
  return result[0] > 0;
}

module.exports = {
  getAdminCount,
  getAdminById,
  getAdminByUsername,
  createAdmin,
  isValidAdminCredentials,
  changeAdminPassword,
};
