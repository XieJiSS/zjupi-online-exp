/** @format */
import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "../../../types/type-helper";
import { StudentModel } from "../../models/all-models";
declare function getLinkByStudentId(studentId: number): Promise<import("../../models/AccessLink").AccessLinkModel | null>;
declare function getLinkByStudentPhone(phone: string): Promise<import("../../models/AccessLink").AccessLinkModel | null>;
declare function createStudent(name: string, phone: string): Promise<StudentModel | null>;
declare function getStudentByLinkId(linkId: number): Promise<StudentModel | null>;
declare function getStudentByLinkIdAttrsOnly<T extends TExtractAttrsFromModel<StudentModel>>(linkId: number, attributes: Readonly<T[]>): Promise<TPartialModel<StudentModel, T> | null>;
declare function setStudentLinkId(studentId: number, linkId: number): Promise<StudentModel | null>;
declare function getAllStudents(): Promise<StudentModel[]>;
declare function getAllStudentsAttrsOnly<T extends TExtractAttrsFromModel<StudentModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<StudentModel, T>>;
declare function getStudentById(studentId: number): Promise<StudentModel | null>;
declare function getStudentByIdAttrsOnly<T extends TExtractAttrsFromModel<StudentModel>>(studentId: number, attributes: Readonly<T[]>): Promise<TPartialModel<StudentModel, T> | null>;
declare function getCameraByStudentId(studentId: number): Promise<import("../../models/Camera").CameraModel | null>;
declare function getCameraByStudentPhone(phone: string): Promise<import("../../models/Camera").CameraModel | null>;
declare function getRemoteClientByStudentId(studentId: number): Promise<import("../../models/RemoteClient").RemoteClientModel | null>;
declare function getRemoteClientByStudentPhone(phone: string): Promise<import("../../models/RemoteClient").RemoteClientModel | null>;
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
