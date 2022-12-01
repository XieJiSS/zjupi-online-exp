/** @format */
import type { DBLogModel } from "db/models/all-models";
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "types/type-helper";
export declare function createDBLog(level: "info" | "warn" | "error", text: string, sourceFile: string): Promise<DBLogModel>;
declare function getAllLogs(): Promise<DBLogModel[]>;
declare function getAllLogsAttrsOnly<T extends TExtractAttrsFromModel<DBLogModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<DBLogModel, T>>;
declare function getLogById(logId: number): Promise<DBLogModel | null>;
declare function getLogByIdAttrsOnly<T extends TExtractAttrsFromModel<DBLogModel>>(logId: number, attributes: Readonly<T[]>): Promise<TPartialModel<DBLogModel, T> | null>;
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
