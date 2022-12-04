/** @format */
export declare const app: import("express-serve-static-core").Express;
/** /api/camera/register */
export interface CameraRegisterReqBody {
    cameraId: string;
}
/** /api/camera/heartbeat */
export interface CameraHeartbeatReqBody {
    cameraId: string;
}
/** /api/camera/reportError */
export interface CameraReportErrorReqBody {
    cameraId: string;
    summary: string;
    detail: string;
    timestamp: number;
}
export { port, name, subdomain } from "./config";
