/** @format */
export declare const app: import("express-serve-static-core").Express;
/** /api/remote-control/clients */
export interface RemoteControlClientRespData {
    clientId: string;
    ip: string;
    lastActive: number | null;
}
/** /api/remote-control/getUpdate/:clientId */
export interface RemoteControlGetUpdateRespData {
    id: number;
    command: string;
    args: string[];
}
/** /api/remote-control/rejectUpdate */
export interface RemoteControlRejectUpdateReqBody {
    clientId: string;
    commandId: number;
    reportedResult: string;
}
/** /api/remote-control/resolveUpdate */
export interface RemoteControlResolveUpdateReqBody {
    clientId: string;
    commandId: number;
}
/** /api/remote-control/getAvailableClientId */
export interface RemoteControlGetAvailableClientIdRespData {
    clientId: string;
}
/** /api/remote-control/registerClient */
export interface RemoteControlRegisterClientReqBody {
    clientId: string;
    password: string;
}
/** /api/remote-control/updatePassword */
export interface RemoteControlSyncPasswordReqBody {
    clientId: string;
    password: string;
}
export { port, name, subdomain } from "./config";
