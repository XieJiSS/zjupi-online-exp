/** @format */
import type { CameraModel } from "../../models/all-models";
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr, TMarkPartialAttrs } from "../../../types/type-helper";
import type { CameraReportErrorReqBody } from "../../../camera/camera-server";
declare function getCameraById(cameraId: string): Promise<CameraModel | null>;
declare function getCameraByIdAttrsOnly<T extends TExtractAttrsFromModel<CameraModel>>(cameraId: string, attributes: Readonly<T[]>): Promise<TPartialModel<CameraModel, T> | null>;
declare function createCamera(cameraId: string, ip: string): Promise<CameraModel | null>;
declare function isCameraOnline(cameraId: string): Promise<boolean>;
declare function getAllCameras(): Promise<CameraModel[]>;
declare function getAllCamerasAttrsOnly<T extends TExtractAttrsFromModel<CameraModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<CameraModel, T>>;
declare function getAllOnlineCameras(): Promise<CameraModel[]>;
declare function getAllOnlineCamerasAttrsOnly<T extends TExtractAttrsFromModel<CameraModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<CameraModel, T>>;
declare function appendCameraErrorReport(cameraId: string, error: TMarkPartialAttrs<CameraReportErrorReqBody, "cameraId">): Promise<void>;
declare function removeCamera(cameraId: string): Promise<void>;
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
