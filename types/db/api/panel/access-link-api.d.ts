export type AccessLinkValidTimeOptions = {
    validAfter?: Date;
    validUntil?: Date;
};
export type TModelType<T> = T extends import("sequelize").ModelCtor<infer I> ? I : never;
export type TModelAttributesType<U> = U extends import("sequelize").Model<infer I, infer _> ? I : never;
export type TModelKey<V> = keyof TModelAttributesType<TModelType<V>>;
/**
 * @typedef AccessLinkValidTimeOptions
 * @prop {Date} [validAfter]
 * @prop {Date} [validUntil]
 */
/**
 * @param {string} clientId
 * @param {Required<AccessLinkValidTimeOptions>} options
 */
export function createAccessLink(clientId: string, options: Required<AccessLinkValidTimeOptions>): Promise<import("../../models/AccessLink").TModel>;
/**
 * @param {number} linkId
 */
export function removeAccessLink(linkId: number): Promise<boolean>;
/**
 * @param {number} linkId
 * @param {string} cameraId
 */
export function assignCameraToLink(linkId: number, cameraId: string): Promise<boolean>;
/**
 * @param {number} linkId
 */
export function removeCameraFromLink(linkId: number): Promise<boolean>;
/**
 * @param {number} linkId
 * @param {number} studentId
 */
export function assignLinkToStudent(linkId: number, studentId: number): Promise<boolean>;
/**
 * @param {number} linkId
 */
export function removeLinkFromStudent(linkId: number): Promise<boolean>;
/**
 * @description assign a link to a remote client, while removing the link from the previous client
 * @param {number} linkId
 * @param {string} clientId
 */
export function assignLinkToRemoteClient(linkId: number, clientId: string): Promise<boolean>;
/**
 * @param {number} linkId
 */
export function getLinkById(linkId: number): Promise<import("../../models/AccessLink").TModel>;
/**
 * @param {number} linkId
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
export function getLinkByIdAttrsOnly(linkId: number, attributes: TModelKey<typeof AccessLink>[]): Promise<import("../../models/AccessLink").TModel>;
/**
 * @param {string} linkPath
 */
export function getLinkByLinkPath(linkPath: string): Promise<import("../../models/AccessLink").TModel>;
/**
 * @param {string} linkPath
 */
export function getLinkIfValidByLinkPath(linkPath: string): Promise<import("../../models/AccessLink").TModel>;
export function getAllLinks(): Promise<import("../../models/AccessLink").TModel[]>;
/**
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
export function getAllLinksAttrsOnly(attributes: TModelKey<typeof AccessLink>[]): Promise<import("../../models/AccessLink").TModel[]>;
export function getAllValidLinks(): Promise<import("../../models/AccessLink").TModel[]>;
/**
 * @param {TModelKey<typeof AccessLink>[]} attributes
 */
export function getAllValidLinksAttrsOnly(attributes: TModelKey<typeof AccessLink>[]): Promise<import("../../models/AccessLink").TModel[]>;
/**
 * @param {number} linkId
 */
export function invalidateLinkById(linkId: number): Promise<boolean>;
/**
 * @param {string} linkPath
 */
export function invalidateLinkByLinkPath(linkPath: string): Promise<boolean>;
/**
 * @param {number} linkId
 * @param {Date} validUntil
 */
export function revalidateLinkById(linkId: number, validUntil: Date): Promise<boolean>;
/**
 * @param {number} linkId
 * @param {AccessLinkValidTimeOptions} options
 */
export function setValidTimeById(linkId: number, options: AccessLinkValidTimeOptions): Promise<boolean>;
import { AccessLink } from "../../models/all-models";
