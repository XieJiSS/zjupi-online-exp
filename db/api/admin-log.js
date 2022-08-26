// @ts-check

const assert = require("assert");

const { hasAuthed } = require("../connect");
assert(hasAuthed());

const { inspect } = require("util");
const { AdminLog } = require("../models/models");

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

/**
 * @param {string} text
 * @param {string} source __filename
 * @param {"info" | "warn" | "error"} level
 */
async function createDBLog(level, text, source) {
  return await AdminLog.create({
    level,
    text,
    source,
  });
}

async function getAllLogs() {
  return await AdminLog.findAll();
}

/**
 * @param {TModelKey<typeof AdminLog>[]} attributes
 */
async function getAllLogsWithSpecificAttributes(attributes) {
  return await AdminLog.findAll({ attributes });
}

/**
 * @param {"info" | "warn" | "error"} level
 * @param {string} source __filename
 * @param {(message: any, ...args: any[]) => void} oldLogger
 */
function hookLogUtil(level, source, oldLogger) {
  return (message, ...args) => {
    const allArgs = [message, ...args];
    let errmsg = "";
    for (const arg of allArgs) {
      if (typeof arg === "object" && arg !== null) {
        errmsg += inspect(arg);
      } else {
        errmsg += arg;
      }
      errmsg += " ";
    }
    createDBLog(level, errmsg, source).catch((err) => {
      oldLogger("failed to write", level, "log:", err);
    });
    oldLogger(message, ...args);
  };
}

module.exports = {
  createDBLog,
  getAllLogs,
  getAllLogsWithSpecificAttributes,
  hookLogUtil,
};
