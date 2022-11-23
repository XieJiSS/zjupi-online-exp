import type { RemoteClientModelCtor, AccessLinkModelCtor } from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly, TExtractModel } from "types/type-helper";
declare function generateRandomClientId(): string;
export interface RemoteControlDirective {
    command: string;
    displayText: string;
}
declare function createRemoteCommand(clientId: string, directive: RemoteControlDirective, args: string[]): Promise<import("../../models/RemoteCommand").RemoteCommandModel>;
declare function getRemoteCommands(): Promise<import("../../models/RemoteCommand").RemoteCommandModel[]>;
declare function getRemoteCommandsByClientId(clientId: string): Promise<import("../../models/RemoteCommand").RemoteCommandModel[]>;
declare function getRemoteCommandsByClientIdAndStatus(clientId: string, status: "running" | "finished" | "failed"): Promise<import("../../models/RemoteCommand").RemoteCommandModel[]>;
/**
 * @param {string} clientId
 * @param {number} commandId
 */
declare function getRemoteCommandById(clientId: string, commandId: number): Promise<import("../../models/RemoteCommand").RemoteCommandModel>;
declare function setRemoteCommandStatus(clientId: string, commandId: number, status: "running" | "finished" | "failed", reportedResult?: string | null): Promise<boolean>;
declare function invalidateRemoteCommandByCommandType(clientId: string, commandType: RemoteControlDirective["command"]): Promise<void>;
/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 */
declare function createRemoteClient(clientId: string, password: string, ip: string): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function getAllRemoteClients(): Promise<import("../../models/RemoteClient").RemoteClientModel[]>;
declare function getAllRemoteClientsAttrsOnly<T extends TExtractModelKeyUnion<RemoteClientModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<RemoteClientModelCtor, T>>;
declare type TRemoteClientWithLink = TExtractModel<RemoteClientModelCtor> & {
    link: TExtractModel<AccessLinkModelCtor>;
};
declare function getAllRemoteClientsWithLinks(): Promise<TRemoteClientWithLink[]>;
declare function getRemoteClientById(clientId: string): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function getRemoteClientByIdAttrsOnly<T extends TExtractModelKeyUnion<RemoteClientModelCtor>>(clientId: string, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<RemoteClientModelCtor, T>>;
declare function removeRemoteClientById(clientId: string): Promise<void>;
declare function setRemoteClientPasswordById(clientId: string, password: string): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function invalidatePasswordById(clientId: string): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function setActiveByRemoteClientId(clientId: string): Promise<void>;
declare function isRemoteClientActive(clientId: string): Promise<boolean>;
declare const _default: {
    generateRandomClientId: typeof generateRandomClientId;
    createRemoteCommand: typeof createRemoteCommand;
    getRemoteCommands: typeof getRemoteCommands;
    getRemoteCommandById: typeof getRemoteCommandById;
    getRemoteCommandsByClientId: typeof getRemoteCommandsByClientId;
    getRemoteCommandsByClientIdAndStatus: typeof getRemoteCommandsByClientIdAndStatus;
    setRemoteCommandStatus: typeof setRemoteCommandStatus;
    invalidateRemoteCommandByCommandType: typeof invalidateRemoteCommandByCommandType;
    createRemoteClient: typeof createRemoteClient;
    getAllRemoteClients: typeof getAllRemoteClients;
    getAllRemoteClientsAttrsOnly: typeof getAllRemoteClientsAttrsOnly;
    getAllRemoteClientsWithLinks: typeof getAllRemoteClientsWithLinks;
    getRemoteClientById: typeof getRemoteClientById;
    getRemoteClientByIdAttrsOnly: typeof getRemoteClientByIdAttrsOnly;
    removeRemoteClientById: typeof removeRemoteClientById;
    setRemoteClientPasswordById: typeof setRemoteClientPasswordById;
    invalidatePasswordById: typeof invalidatePasswordById;
    setActiveByRemoteClientId: typeof setActiveByRemoteClientId;
    isRemoteClientActive: typeof isRemoteClientActive;
};
export default _default;
