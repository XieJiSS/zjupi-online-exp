// @ts-check

const log4js = require("log4js");

log4js.configure({
  appenders: {
    out: { type: "stdout" },
  },
  categories: {
    default: {
      appenders: ["out"],
      level: process.env["LOG_LEVEL"] || "OFF",
    },
  },
});

/**
 * @type {Map<string, log4js.Logger>}
 */
const existingLoggers = new Map();

/**
 * @param {string} name
 * @returns {log4js.Logger}
 */
module.exports = function getLogger(name) {
  if (existingLoggers.has(name)) {
    return /** @type {log4js.Logger} */ (existingLoggers.get(name));
  }
  const logger = log4js.getLogger(name);
  existingLoggers.set(name, logger);
  return logger;
};
