/** @format */
import type { RemoteClientModel, RemoteCommandModel, AccessLinkModel } from "db/models/all-models";
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "types/type-helper";
declare function generateRandomClientId(): string;
export interface RemoteControlDirective {
    command: string;
    displayText: string;
}
declare function createRemoteCommand(clientId: string, directive: RemoteControlDirective, args: string[]): Promise<RemoteCommandModel | null>;
declare function getRemoteCommands(): Promise<RemoteCommandModel[]>;
declare function getRemoteCommandsByClientId(clientId: string): Promise<RemoteCommandModel[]>;
declare function getRemoteCommandsByClientIdAndStatus(clientId: string, status: "running" | "finished" | "failed"): Promise<RemoteCommandModel[]>;
declare function getRemoteCommandById(clientId: string, commandId: number): Promise<RemoteCommandModel | null>;
declare function setRemoteCommandStatus(clientId: string, commandId: number, status: "running" | "finished" | "failed", reportedResult?: string | null): Promise<boolean>;
declare function invalidateRemoteCommandByCommandType(clientId: string, commandType: RemoteControlDirective["command"]): Promise<void>;
/**
 * @param {string} clientId
 * @param {string} password
 * @param {string} ip
 */
declare function createRemoteClient(clientId: string, password: string, ip: string): Promise<RemoteClientModel | null>;
declare function getAllRemoteClients(): Promise<RemoteClientModel[]>;
declare function getAllRemoteClientsAttrsOnly<T extends TExtractAttrsFromModel<RemoteClientModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<RemoteClientModel, T>>;
type TRemoteClientWithLink = RemoteClientModel & {
    link: AccessLinkModel;
};
declare function getAllRemoteClientsWithLinks(): Promise<TRemoteClientWithLink[]>;
declare function getRemoteClientById(clientId: string): Promise<RemoteClientModel | null>;
declare function getRemoteClientByIdAttrsOnly<T extends TExtractAttrsFromModel<RemoteClientModel>>(clientId: string, attributes: Readonly<T[]>): Promise<TPartialModel<RemoteClientModel, T>>;
declare function removeRemoteClientById(clientId: string): Promise<void>;
declare function setRemoteClientPasswordById(clientId: string, password: string): Promise<RemoteClientModel | null>;
declare function invalidatePasswordById(clientId: string): Promise<RemoteClientModel | null>;
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
