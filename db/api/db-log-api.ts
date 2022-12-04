/** @format */

import * as assert from "assert";

import { hasAuthed } from "../connect";
assert(hasAuthed());

import { inspect } from "util";
import { DBLog } from "../models/all-models";
import type { DBLogModel } from "../models/all-models";

import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "../../types/type-helper";

export async function createDBLog(level: "info" | "warn" | "error", text: string, sourceFile: string) {
  return await DBLog.create({
    level,
    text,
    source: sourceFile,
  });
}

async function getAllLogs() {
  return await DBLog.findAll();
}

async function getAllLogsAttrsOnly<T extends TExtractAttrsFromModel<DBLogModel>>(
  attributes: Readonly<T[]>
): Promise<TPartialModelArr<DBLogModel, T>> {
  return (await DBLog.findAll({
    attributes: attributes as T[],
  })) as TPartialModelArr<DBLogModel, T>;
}

async function getLogById(logId: number) {
  return await DBLog.findOne({ where: { logId } });
}

async function getLogByIdAttrsOnly<T extends TExtractAttrsFromModel<DBLogModel>>(
  logId: number,
  attributes: Readonly<T[]>
): Promise<TPartialModel<DBLogModel, T> | null> {
  return (await DBLog.findOne({
    where: { logId },
    attributes: attributes as T[],
  })) as TPartialModel<DBLogModel, T>;
}

/**
 * @param level DB log level
 * @param sourceFile should be __filename
 * @param oldLogger non-persistent logger which will be wrapped
 */
export function getPersistentLoggerUtil(
  level: "info" | "warn" | "error",
  sourceFile: string,
  oldLogger: (message: any, ...args: any[]) => void
): (message: any, ...args: any[]) => void {
  return (message, ...args) => {
    const allArgs = [message, ...args];
    let errmsg = "";
    for (const arg of allArgs) {
      if (typeof arg === "object" && arg !== null) {
        errmsg += inspect(arg);
      } else if (typeof arg === "function") {
        errmsg += `[function ${arg.name} len=${arg.length}]`;
      } else {
        errmsg += arg;
      }
      errmsg += " ";
    }
    createDBLog(level, errmsg, sourceFile).catch((err) => {
      oldLogger("failed to write", level, "due to", err);
    });
    oldLogger(message, ...args);
  };
}

export default {
  createDBLog,
  getAllLogs,
  getAllLogsAttrsOnly,
  getLogById,
  getLogByIdAttrsOnly,
  getPersistentLoggerUtil,
};
