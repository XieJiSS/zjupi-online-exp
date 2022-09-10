export type Directive = {
    command: string;
    displayText: string;
};
export type TRemoteClientWithLink = TModelType<typeof RemoteClient> & {
    link: TModelType<typeof AccessLink>;
};
export type TModelType<T> = T extends import("sequelize").ModelCtor<infer I> ? I : never;
export type TModelAttributesType<U> = U extends import("sequelize").Model<infer I, infer _> ? I : never;
export type TModelKey<V> = keyof TModelAttributesType<TModelType<V>>;
/**
 * @typedef Directive
 * @prop {string} command
 * @prop {string} displayText
 */
export function generateRandomClientId(): string;
/**
 * @param {string} clientId
 * @param {Directive} directive
 * @param {string[]} args
 */
export function createRemoteCommand(clientId: string, directive: Directive, args: string[]): Promise<import("../../models/RemoteCommand").TModel>;
export function getRemoteCommands(): Promise<import("../../models/RemoteCommand").TModel[]>;
/**
 * @param {string} clientId
 * @param {number} commandId
 */
export function getRemoteCommandById(clientId: string, commandId: number): Promise<import("../../models/RemoteCommand").TModel>;
/**
 * @param {string} clientId
 */
export function getRemoteCommandsByClientId(clientId: string): Promise<import("../../models/RemoteCommand").TModel[]>;
/**
 * @param {string} clientId
 * @param {"running" | "finished" | "failed"} status
 */
export function getRemoteCommandsByClientIdAndStatus(clientId: string, status: "running" | "finished" | "failed"): Promise<import("../../models/RemoteCommand").TModel[]>;
/**
 * @param {string} clientId
 * @param {number} commandId
 * @param {"running" | "finished" | "failed"} status
 * @param {string | null} [reportedResult]
 */
export function setRemoteCommandStatus(clientId: string, commandId: number, status: "running" | "finished" | "failed", reportedResult?: string | null): Promise<boolean>;
/**
 * @param {string} clientId
 * @param {Directive["command"]} commandType
 */
export function invalidateRemoteCommandByCommandType(clientId: string, commandType: Directive["command"]): Promise<void>;
/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 */
export function createRemoteClient(clientId: string, password: string, ip: string): Promise<import("../../models/RemoteClient").TModel>;
export function getAllRemoteClients(): Promise<import("../../models/RemoteClient").TModel[]>;
/**
 * @typedef {TModelType<typeof RemoteClient> & { link: TModelType<typeof AccessLink> }} TRemoteClientWithLink
 */
export function getAllRemoteClientsWithLinks(): Promise<TRemoteClientWithLink[]>;
/**
 * @param {string} clientId
 */
export function getRemoteClientById(clientId: string): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {string} clientId
 * @param {TModelKey<typeof RemoteClient>[]} attributes
 */
export function getRemoteClientByIdAttrsOnly(clientId: string, attributes: TModelKey<typeof RemoteClient>[]): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {string} clientId
 */
export function removeRemoteClientById(clientId: string): Promise<void>;
/**
 * @param {string} clientId
 * @param {string} password
 */
export function setRemoteClientPasswordById(clientId: string, password: string): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {string} clientId
 */
export function invalidatePasswordById(clientId: string): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {string} clientId
 */
export function setActiveByRemoteClientId(clientId: string): Promise<void>;
/**
 * @param {string} clientId
 * @returns {Promise<boolean>}
 */
export function isRemoteClientActive(clientId: string): Promise<boolean>;
import { RemoteClient } from "../../models/all-models";
import { AccessLink } from "../../models/all-models";
