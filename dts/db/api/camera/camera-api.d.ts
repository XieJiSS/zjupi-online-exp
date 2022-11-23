import type { CameraModelCtor } from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly, TMarkPartialAttrs } from "types/type-helper";
import type { CameraReportErrorReqBody } from "camera/camera-server";
declare function getCameraById(cameraId: string): Promise<import("../../models/Camera").CameraModel>;
declare function getCameraByIdAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(cameraId: string, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<CameraModelCtor, T>>;
declare function createCamera(cameraId: string, ip: string): Promise<import("../../models/Camera").CameraModel>;
declare function isCameraOnline(cameraId: string): Promise<boolean>;
declare function getAllCameras(): Promise<import("../../models/Camera").CameraModel[]>;
declare function getAllCamerasAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<CameraModelCtor, T>>;
declare function getAllOnlineCameras(): Promise<import("../../models/Camera").CameraModel[]>;
declare function getAllOnlineCamerasAttrsOnly<T extends TExtractModelKeyUnion<CameraModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<CameraModelCtor, T>>;
declare function appendCameraErrorReport(cameraId: string, error: TMarkPartialAttrs<CameraReportErrorReqBody, "cameraId">): Promise<void>;
/**
 * @param {string} cameraId
 */
declare function removeCamera(cameraId: string): Promise<void>;
/**
 * @param {string} cameraId
 */
declare function setActiveByCameraId(cameraId: string): Promise<void>;
declare const _default: {
    getCameraById: typeof getCameraById;
    getCameraByIdAttrsOnly: typeof getCameraByIdAttrsOnly;
    createCamera: typeof createCamera;
    isCameraOnline: typeof isCameraOnline;
    getAllCameras: typeof getAllCameras;
    getAllCamerasAttrsOnly: typeof getAllCamerasAttrsOnly;
    getAllOnlineCameras: typeof getAllOnlineCameras;
    getAllOnlineCamerasAttrsOnly: typeof getAllOnlineCamerasAttrsOnly;
    appendCameraErrorReport: typeof appendCameraErrorReport;
    removeCamera: typeof removeCamera;
    setActiveByCameraId: typeof setActiveByCameraId;
};
export = _default;
