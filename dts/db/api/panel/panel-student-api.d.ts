import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly } from "types/type-helper";
import { StudentModelCtor } from "db/models/all-models";
declare function getLinkByStudentId(studentId: number): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function getLinkByStudentPhone(phone: string): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function createStudent(name: string, phone: string): Promise<import("../../models/Student").StudentModel>;
declare function getStudentByLinkId(linkId: number): Promise<import("../../models/Student").StudentModel>;
declare function getStudentByLinkIdAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(linkId: number, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<StudentModelCtor, T>>;
declare function setStudentLinkId(studentId: number, linkId: number): Promise<import("../../models/Student").StudentModel>;
declare function getAllStudents(): Promise<import("../../models/Student").StudentModel[]>;
declare function getAllStudentsAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<StudentModelCtor, T>>;
declare function getStudentById(studentId: number): Promise<import("../../models/Student").StudentModel>;
declare function getStudentByIdAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(studentId: number, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<StudentModelCtor, T>>;
declare function getCameraByStudentId(studentId: number): Promise<import("../../models/Camera").CameraModel>;
declare function getCameraByStudentPhone(phone: string): Promise<import("../../models/Camera").CameraModel>;
declare function getRemoteClientByStudentId(studentId: number): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function getRemoteClientByStudentPhone(phone: string): Promise<import("../../models/RemoteClient").RemoteClientModel>;
declare function removeStudentById(studentId: number): Promise<void>;
declare const _default: {
    createStudent: typeof createStudent;
    getLinkByStudentId: typeof getLinkByStudentId;
    getLinkByStudentPhone: typeof getLinkByStudentPhone;
    getAllStudents: typeof getAllStudents;
    getAllStudentsAttrsOnly: typeof getAllStudentsAttrsOnly;
    getStudentById: typeof getStudentById;
    getStudentByIdAttrsOnly: typeof getStudentByIdAttrsOnly;
    getStudentByLinkId: typeof getStudentByLinkId;
    getStudentByLinkIdAttrsOnly: typeof getStudentByLinkIdAttrsOnly;
    getCameraByStudentId: typeof getCameraByStudentId;
    getCameraByStudentPhone: typeof getCameraByStudentPhone;
    getRemoteClientByStudentId: typeof getRemoteClientByStudentId;
    getRemoteClientByStudentPhone: typeof getRemoteClientByStudentPhone;
    setStudentLinkId: typeof setStudentLinkId;
    removeStudentById: typeof removeStudentById;
};
export default _default;
