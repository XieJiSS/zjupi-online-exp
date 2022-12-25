/** @format */

import log4js from "log4js";

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

interface CustomLogger extends log4js.Logger {
  warn: (message: any, ...args: any[]) => void | Promise<void>;
  error: (message: any, ...args: any[]) => void | Promise<void>;
}

const existingLoggers: Map<string, CustomLogger> = new Map();

export default function getLogger(name: string): CustomLogger {
  if (existingLoggers.has(name)) {
    return existingLoggers.get(name) as CustomLogger;
  }
  const logger: CustomLogger = log4js.getLogger(name);
  existingLoggers.set(name, logger);
  return logger;
}
