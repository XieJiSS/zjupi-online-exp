import type { DBLogModelCtor } from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly } from "types/type-helper";
export declare function createDBLog(level: "info" | "warn" | "error", text: string, sourceFile: string): Promise<import("../models/DBLog").DBLogModel>;
declare function getAllLogs(): Promise<import("../models/DBLog").DBLogModel[]>;
declare function getAllLogsAttrsOnly<T extends TExtractModelKeyUnion<DBLogModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<DBLogModelCtor, T>>;
declare function getLogById(logId: number): Promise<import("../models/DBLog").DBLogModel>;
declare function getLogByIdAttrsOnly<T extends TExtractModelKeyUnion<DBLogModelCtor>>(logId: number, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<DBLogModelCtor, T>>;
/**
 * @param level DB log level
 * @param sourceFile should be __filename
 * @param oldLogger non-persistent logger which will be wrapped
 */
export declare function getPersistentLoggerUtil(level: "info" | "warn" | "error", sourceFile: string, oldLogger: (message: any, ...args: any[]) => void): (message: any, ...args: any[]) => void;
declare const _default: {
    createDBLog: typeof createDBLog;
    getAllLogs: typeof getAllLogs;
    getAllLogsAttrsOnly: typeof getAllLogsAttrsOnly;
    getLogById: typeof getLogById;
    getLogByIdAttrsOnly: typeof getLogByIdAttrsOnly;
    getPersistentLoggerUtil: typeof getPersistentLoggerUtil;
};
export default _default;
