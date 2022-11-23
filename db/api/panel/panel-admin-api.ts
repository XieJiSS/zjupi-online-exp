// @ts-check

import assert from "assert";
import { hasAuthed } from "db/connect";
assert(hasAuthed());

import crypto from "crypto";
import { promisify } from "util";
const pbkdf2 = promisify(crypto.pbkdf2);

import getLogger from "util/logger";
import { getPersistentLoggerUtil } from "db/api/db-log-api";
const logger = getLogger("panel-admin-api");
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import { Admin } from "db/models/all-models";

async function _getPBKDF2Hash(password: string, salt: string) {
  const iterations = 10000;
  const keyLen = 64;
  return (await pbkdf2(password, salt, iterations, keyLen, "sha512")).toString("base64");
}

interface SaltHashPair {
  hash: string;
  salt: string;
}
/** @description PBKDF sha512 */
async function _generateSaltHashPair(password: string): Promise<SaltHashPair> {
  const salt = crypto.randomBytes(64).toString("base64");
  const hash = await _getPBKDF2Hash(password, salt);
  return { hash, salt };
}

async function getAdminCount() {
  return await Admin.count();
}

async function getAdminByUsername(username: string) {
  return await Admin.findOne({ where: { username } });
}

async function getAdminById(adminId: number) {
  return await Admin.findByPk(adminId);
}

async function createAdmin(username: string, password: string) {
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

async function isValidAdminCredentials(username: string, password: string) {
  const admin = await getAdminByUsername(username);
  if (admin === null) {
    return false;
  }
  const { hash, salt } = admin;
  const hash2 = await _getPBKDF2Hash(password, salt);
  return hash === hash2;
}

async function changeAdminPassword(adminId: number, password: string) {
  const { hash, salt } = await _generateSaltHashPair(password);
  const result = await Admin.update({ hash, salt }, { where: { adminId } });
  if (result[0] > 0) {
    logger.warn("changeAdminPassword: admin", adminId, "'s password has been changed");
  } else {
    logger.error("changeAdminPassword: admin", adminId, "not found");
  }
  return result[0] > 0;
}

export default {
  getAdminCount,
  getAdminById,
  getAdminByUsername,
  createAdmin,
  isValidAdminCredentials,
  changeAdminPassword,
};
