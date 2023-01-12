/** @format */
import type { RemoteClientModel, StudentModel, CameraModel, AccessLinkModel, DBLogModel, PlaceModel } from "../db/models/all-models";
import { DeviceModelWrapperResp, DevicePosition, UnifiedDevice, VirtualDeviceModel } from "../db/api/devices-api";
import type { TExtractAttrsFromModel, TExtractInterfaceFromModel, TPartialModelPrimitive } from "../types/type-helper";
export type RemoteClientAttrs = TExtractAttrsFromModel<RemoteClientModel>;
export type RemoteClientInterface = TExtractInterfaceFromModel<RemoteClientModel>;
export type StudentAttrs = TExtractAttrsFromModel<StudentModel>;
export type StudentInterface = TExtractInterfaceFromModel<StudentModel>;
export type CameraAttrs = TExtractAttrsFromModel<CameraModel>;
export type CameraInterface = TExtractInterfaceFromModel<CameraModel>;
export type AccessLinkAttrs = TExtractAttrsFromModel<AccessLinkModel>;
export type AccessLinkInterface = TExtractInterfaceFromModel<AccessLinkModel>;
export type DBLogAttrs = TExtractAttrsFromModel<DBLogModel>;
export type DBLogInterface = TExtractInterfaceFromModel<DBLogModel>;
export type DeviceAttrs = keyof UnifiedDevice;
export type DeviceInterface = TExtractInterfaceFromModel<VirtualDeviceModel>;
export type PlaceAttrs = TExtractAttrsFromModel<PlaceModel>;
export type PlaceInterface = TExtractInterfaceFromModel<PlaceModel>;
export declare const app: import("express-serve-static-core").Express;
import type { CameraDirection } from "./camera-req-proxy";
export type { CameraDirection, CameraOperation } from "./camera-req-proxy";
/** /api/panel/access/:link */
export interface PanelAccessRespData {
    remoteClient: TPartialModelPrimitive<RemoteClientModel, "clientId" | "password" | "ip"> | null;
    student: TPartialModelPrimitive<StudentModel, "name" | "studentId"> | null;
    camera: TPartialModelPrimitive<CameraModel, "cameraId" | "ip"> | null;
}
/** /api/panel/access/:link/camera-control req body */
export type PanelAccessLinkCameraControlReqBody = {
    direction: CameraDirection;
    operation: "start";
    speed: number;
} | {
    direction: void;
    operation: "stop";
    speed?: void;
};
/** /api/panel/admin/login */
export interface PanelAdminLoginReqBody {
    username: string;
    password: string;
}
export interface PanelAdminRegisterReqBody {
    username: string;
    phone: string;
    password: string;
}
export interface PanelAdminPlaceGetRespData {
    placeId: string;
    image: string;
}
export interface PanelAdminPlaceCreateReqBody {
    image: string;
}
export interface PanelAdminPlaceDeleteOneReqBody {
}
export type PanelAdminPlacesDeleteMultiReqBody = {
    placeId: string;
}[];
export interface PanelAdminPlaceDeviceCreateReqBody {
}
export type PanelAdminPlaceDeviceListRespData = DeviceModelWrapperResp[];
export interface PanelAdminPlaceDeviceGetRespData {
    device: DeviceModelWrapperResp;
    position: DevicePosition;
}
export interface PanelAdminPlaceDeviceUpdateReqBody {
    position?: DevicePosition;
    state?: boolean;
    value?: number;
}
/** /api/panel/admin/student{s,/:id} */
export type PanelAdminStudentRespData = TPartialModelPrimitive<StudentModel, "name" | "studentId" | "phone" | "linkId">;
/** /api/panel/admin/student/add{One,Multi} */
export interface PanelAdminStudentAddReqBody {
    name: string;
    phone: string;
}
/** /api/panel/admin/student/delete{One,Multi}  */
export interface PanelAdminStudentDeleteReqBody {
    studentId: number;
}
/** /api/panel/admin/link{s,/:id} resp data */
export type PanelAdminLinkRespData = AccessLinkModel;
/** /api/panel/admin/link/add{One,Multi} request Interface */
export interface PanelAdminLinkAddReqBody {
    clientId: string;
    validAfterTimeStamp: number;
    validUntilTimeStamp: number;
}
/** /api/panel/admin/link/edit{One,Multi} request interface */
export interface PanelAdminLinkEditReqBody {
    linkId: number;
    shouldRevalidate: boolean;
    shouldInvalidate: boolean;
    validAfterTimeStamp?: number;
    validUntilTimeStamp?: number;
}
/** /api/panel/admin/link/assignToStudent{One,Multi} request interface */
export interface PanelAdminLinkAssignToStudentReqBody {
    linkId: number;
    studentId: number;
}
/** /api/panel/admin/link/delete{One,Multi} request interface */
export interface PanelAdminLinkDeleteReqBody {
    linkId: number;
}
/** /api/panel/admin/rclient/:id */
export interface PanelAdminRClientRespData {
    rclient: RemoteClientModel;
    link: AccessLinkModel | null;
    student: StudentModel | null;
    camera: CameraModel | null;
}
/** /api/panel/admin/rclient/:id req interface */
export interface PanelAdminRClientRestartReqBody {
    t: number;
}
/** /api/panel/admin/camera{s,/:id} */
export type PanelAdminCameraRespData = CameraModel;
/** /api/panel/admin/camera/assignToLink{One,Multi} request interface */
export interface PanelAdminCameraAssignToLinkReqBody {
    cameraId: string;
    linkId: number;
}
/** /api/panel/admin/camera/removeFromLink{One,Multi} request interface */
export interface PanelAdminCameraRemoveFromLinkReqBody {
    linkId: number;
}
/** /api/panel/admin/log{s,/:id} */
export type PanelAdminLogRespData = DBLogModel;
export { port, name, subdomain } from "./config";
