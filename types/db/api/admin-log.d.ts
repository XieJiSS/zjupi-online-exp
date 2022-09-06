export type TModelType<T> = T extends import("sequelize").ModelCtor<infer I> ? I : never;
export type TModelAttributesType<U> = U extends import("sequelize").Model<infer I, infer _> ? I : never;
export type TModelKey<V> = keyof TModelAttributesType<TModelType<V>>;
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
export function createDBLog(level: "info" | "warn" | "error", text: string, source: string): Promise<import("../models/AdminLog").TModel>;
export function getAllLogs(): Promise<import("../models/AdminLog").TModel[]>;
/**
 * @param {TModelKey<typeof AdminLog>[]} attributes
 */
export function getAllLogsAttrsOnly(attributes: TModelKey<typeof AdminLog>[]): Promise<import("../models/AdminLog").TModel[]>;
/**
 * @param {"info" | "warn" | "error"} level
 * @param {string} source __filename
 * @param {(message: any, ...args: any[]) => void} oldLogger
 */
export function hookLogUtil(level: "info" | "warn" | "error", source: string, oldLogger: (message: any, ...args: any[]) => void): (message: any, ...args: any[]) => void;
import { AdminLog } from "../models/all-models";
