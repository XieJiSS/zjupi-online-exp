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
export interface RemoteControlUpdatePasswordReqBody {
    clientId: string;
    commandId: number;
    password: string;
}
