import type { RemoteClientModelCtor, StudentModelCtor, CameraModelCtor, AccessLinkModelCtor } from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TExtractModel } from "types/type-helper";
export declare type RClientAttributes = TExtractModelKeyUnion<RemoteClientModelCtor>;
export declare type StudentAttributes = TExtractModelKeyUnion<StudentModelCtor>;
export declare type CameraAttributes = TExtractModelKeyUnion<CameraModelCtor>;
export declare type LinkAttributes = TExtractModelKeyUnion<AccessLinkModelCtor>;
/** /api/panel/access/:link */
export interface PanelAccessRespData {
    remoteClient: TModelAttrsOnly<RemoteClientModelCtor, "clientId" | "password" | "ip">;
    student: TModelAttrsOnly<StudentModelCtor, "name">;
    camera: TModelAttrsOnly<CameraModelCtor, "cameraId" | "ip">;
}
/** /api/panel/admin/login */
export interface PanelAdminLoginReqBody {
    username: string;
    password: string;
}
/** /api/panel/admin/student/add{One,Multi} */
export interface PanelAdminStudentAddReqBody {
    name: string;
    phone: string;
}
/** /api/panel/admin/student/delete{One,Multi}  */
export interface PanelAdminStudentDeleteReqBody {
    studentId: number;
}
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
    rclient: TExtractModel<RemoteClientModelCtor>;
    link: TExtractModel<AccessLinkModelCtor>;
    student: TExtractModel<StudentModelCtor>;
    camera: TExtractModel<CameraModelCtor>;
}
declare const _default: {
    app: import("express-serve-static-core").Express;
    port: number;
    name: string;
    subdomain: string;
};
export default _default;
