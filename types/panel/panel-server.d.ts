export type AsyncReturnType<T> = T extends (...args: any) => Promise<infer I> ? I : never;
export type ArrayInnerType<U> = U extends (infer I)[] ? I : never;
export type RClientAttributes = ArrayInnerType<[clientId: string, attributes: ("password" | "online" | "clientId" | "passwordExpireAt" | "nextPassword" | "ip" | "lastActive" | "isDead" | "linkId")[]][1]>;
export type StudentAttributes = ArrayInnerType<[studentId: any, attributes: ("name" | "linkId" | "studentId" | "phone")[]][1]>;
export type CameraAttributes = ArrayInnerType<[cameraId: string, attributes: ("online" | keyof import("../db/models/Camera").TCreationAttributes)[]][1]>;
export type LinkAttributes = ArrayInnerType<[linkId: number, attributes: ("clientId" | "linkId" | "createdAt" | "linkPath" | "validAfter" | "validUntil" | "cameraId" | "isValid")[]][1]>;
export type AdminSession = {
    username: string | null;
};
/**
 * /api/panel/admin/login request interface
 */
export type AdminLoginInfo = {
    username: string;
    password: string;
};
export type StudentResponseData = AsyncReturnType<typeof sql.getStudentById>;
/**
 * /api/panel/admin/student/add{One,Multi} request interface
 */
export type AddStudentInfo = {
    name: string;
    phone: string;
};
/**
 * /api/panel/admin/student/delete{One,Multi} request interface
 */
export type DeleteStudentInfo = {
    studentId: number;
};
export type LinkResponseData = AsyncReturnType<typeof sql.getLinkById>;
/**
 * /api/panel/admin/link/add{One,Multi} request Interface
 */
export type AddLinkInfo = {
    clientId: string;
    validAfterTimeStamp: number;
    validUntilTimeStamp: number;
};
/**
 * /api/panel/admin/link/edit{One,Multi} request interface
 */
export type EditLinkInfo = {
    linkId: number;
    shouldRevalidate: boolean;
    shouldInvalidate: boolean;
    validAfterTimeStamp?: number;
    validUntilTimeStamp?: number;
};
/**
 * /api/panel/admin/link/assignToStudent{One,Multi} request interface
 */
export type AssignLinkToStudentInfo = {
    linkId: number;
    studentId: number;
};
/**
 * /api/panel/admin/link/delete{One,Multi} request interface
 */
export type DeleteLinkInfo = {
    linkId: number;
};
export type RClientResponseData = {
    rclient: AsyncReturnType<typeof sql.getRemoteClientById>;
    link: AsyncReturnType<typeof sql.getLinkById>;
    student: AsyncReturnType<typeof sql.getStudentById>;
    camera: AsyncReturnType<typeof sql.getCameraById>;
};
/**
 * /api/panel/admin/rclient/:id response interface
 */
export type RClientResponse = {
    success: boolean;
    message: string;
    data?: RClientResponseData;
};
export type CameraResponseData = AsyncReturnType<typeof sql.getCameraById>;
export const app: import("express-serve-static-core").Express;
import { port } from "./config";
import { name as serverName } from "./config";
import { subdomain } from "./config";
import sql = require("../db/api/all-apis");
export { port, serverName as name, subdomain };
