/** @format */
import type { RemoteClientModel, StudentModel, CameraModel, AccessLinkModel, DBLogModel } from "../db/models/all-models";
import type { TExtractAttrsFromModel, TExtractInterfaceFromModel, TPartialModel } from "../types/type-helper";
/** /api/panel/access/:link */
export interface PanelAccessRespData {
    remoteClient: TPartialModel<RemoteClientModel, "clientId" | "password" | "ip"> | null;
    student: TPartialModel<StudentModel, "name"> | null;
    camera: TPartialModel<CameraModel, "cameraId" | "ip"> | null;
}
/** /api/panel/admin/login */
export interface PanelAdminLoginReqBody {
    username: string;
    password: string;
}
/** /api/panel/admin/student{s,/:id} */
export type PanelAdminStudentRespData = TPartialModel<StudentModel, "name" | "studentId" | "phone" | "linkId">;
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
declare const _default: {
    app: import("express-serve-static-core").Express;
    port: number;
    name: string;
    subdomain: string;
};
export default _default;
