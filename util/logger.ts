/** @format */

import * as log4js from "log4js";

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

const existingLoggers: Map<string, log4js.Logger> = new Map();

export default function getLogger(name: string): log4js.Logger {
  if (existingLoggers.has(name)) {
    return existingLoggers.get(name) as log4js.Logger;
  }
  const logger = log4js.getLogger(name);
  existingLoggers.set(name, logger);
  return logger;
}
