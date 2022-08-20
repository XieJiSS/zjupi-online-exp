// @ts-check

const assert = require("assert");

const { hasAuthed } = require("../connect");
assert(hasAuthed());

const { inspect } = require("util");
const { ErrorLog } = require("../models");

/**
 * @param {string} err
 * @param {string} source __filename
 */
async function createErrorLog(err, source) {
  return await ErrorLog.create({
    errorText: err,
    source,
  });
}

async function getAllErrorLogs() {
  return await ErrorLog.findAll();
}

/**
 * @param {string} source __filename
 * @param {(message: any, ...args: any[]) => void} oldErrorLogger
 */
function hookErrorLogUtil(source, oldErrorLogger) {
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
    createErrorLog(errmsg, source).catch((err) => {
      oldErrorLogger("failed to write error log", err);
    });
    oldErrorLogger(message, ...args);
  };
}

module.exports = {
  createErrorLog,
  getAllErrorLogs,
  hookErrorLogUtil,
};
