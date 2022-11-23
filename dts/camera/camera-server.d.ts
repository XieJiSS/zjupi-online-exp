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
declare const _default: {
    app: import("express-serve-static-core").Express;
    port: number;
    name: string;
    subdomain: string;
};
export default _default;
