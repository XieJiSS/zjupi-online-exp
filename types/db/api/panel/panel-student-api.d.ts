export type TModelType<T> = T extends import("sequelize").ModelCtor<infer I> ? I : never;
export type TModelAttributesType<U> = U extends import("sequelize").Model<infer I, infer _> ? I : never;
export type TModelKey<V> = keyof TModelAttributesType<TModelType<V>>;
/**
 * @param {string} name
 * @param {string} phone
 */
export function createStudent(name: string, phone: string): Promise<import("../../models/Student").TModel>;
/**
 * @param {number} studentId
 */
export function getLinkByStudentId(studentId: number): Promise<import("../../models/AccessLink").TModel>;
/**
 * @param {string} phone
 */
export function getLinkByStudentPhone(phone: string): Promise<import("../../models/AccessLink").TModel>;
export function getAllStudents(): Promise<import("../../models/Student").TModel[]>;
/**
 * @param {TModelKey<typeof Student>[]} attributes
 */
export function getAllStudentsAttrsOnly(attributes: TModelKey<typeof Student>[]): Promise<import("../../models/Student").TModel[]>;
/**
 * @param {number} studentId
 */
export function getStudentById(studentId: number): Promise<import("../../models/Student").TModel>;
/**
 * @param {TModelKey<typeof Student>[]} attributes
 */
export function getStudentByIdAttrsOnly(studentId: any, attributes: TModelKey<typeof Student>[]): Promise<import("../../models/Student").TModel>;
/**
 * @param {number} linkId
 */
export function getStudentByLinkId(linkId: number): Promise<import("../../models/Student").TModel>;
/**
 * @param {number} linkId
 * @param {TModelKey<typeof Student>[]} attributes
 */
export function getStudentByLinkIdAttrsOnly(linkId: number, attributes: TModelKey<typeof Student>[]): Promise<import("../../models/Student").TModel>;
/**
 * @param {number} studentId
 */
export function getCameraByStudentId(studentId: number): Promise<import("../../models/Camera").TModel>;
/**
 * @param {string} phone
 */
export function getCameraByStudentPhone(phone: string): Promise<import("../../models/Camera").TModel>;
/**
 * @param {number} studentId
 */
export function getRemoteClientByStudentId(studentId: number): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {string} phone
 */
export function getRemoteClientByStudentPhone(phone: string): Promise<import("../../models/RemoteClient").TModel>;
/**
 * @param {number} studentId
 * @param {number} linkId
 */
export function setStudentLinkId(studentId: number, linkId: number): Promise<import("../../models/Student").TModel>;
/**
 * @param {number} studentId
 */
export function removeStudentById(studentId: number): Promise<void>;
import { Student } from "../../models/all-models";
