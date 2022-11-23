// @ts-check

import assert from "assert";

import { hasAuthed } from "db/connect";
assert(hasAuthed());

import { inspect } from "util";
import { DBLog } from "db/models/all-models";
import type { DBLogModelCtor } from "db/models/all-models";

import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly } from "types/type-helper";

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

async function getAllLogsAttrsOnly<T extends TExtractModelKeyUnion<DBLogModelCtor>>(
  attributes: Readonly<T[]>
): Promise<TModelListAttrsOnly<DBLogModelCtor, T>> {
  return (await DBLog.findAll({
    attributes: attributes as T[],
  })) as TModelListAttrsOnly<DBLogModelCtor, T>;
}

async function getLogById(logId: number) {
  return await DBLog.findOne({ where: { logId } });
}

async function getLogByIdAttrsOnly<T extends TExtractModelKeyUnion<DBLogModelCtor>>(
  logId: number,
  attributes: Readonly<T[]>
): Promise<TModelAttrsOnly<DBLogModelCtor, T>> {
  return (await DBLog.findOne({
    where: { logId },
    attributes: attributes as T[],
  })) as TModelAttrsOnly<DBLogModelCtor, T>;
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
