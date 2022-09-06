export type TModelType<T> = T extends import("sequelize").ModelCtor<infer I> ? I : never;
export type TModelAttributesType<U> = U extends import("sequelize").Model<infer I, infer _> ? I : never;
export type TModelKey<V> = keyof TModelAttributesType<TModelType<V>>;
/**
 * @param {string} cameraId
 */
export function getCameraById(cameraId: string): Promise<import("../../models/Camera").TModel>;
/**
 * @param {string} cameraId
 * @param {TModelKey<typeof Camera>[]} attributes
 */
export function getCameraByIdAttrsOnly(cameraId: string, attributes: TModelKey<typeof Camera>[]): Promise<import("../../models/Camera").TModel>;
/**
 * @param {string} cameraId
 * @param {string} ip
 */
export function createCamera(cameraId: string, ip: string): Promise<import("../../models/Camera").TModel>;
/**
 * @param {string} cameraId
 */
export function isCameraOnline(cameraId: string): Promise<boolean>;
export function getAllCameras(): Promise<import("../../models/Camera").TModel[]>;
/**
 * @param {TModelKey<typeof Camera>[]} attributes
 */
export function getAllCamerasAttrsOnly(attributes: TModelKey<typeof Camera>[]): Promise<import("../../models/Camera").TModel[]>;
export function getAllOnlineCameras(): Promise<import("../../models/Camera").TModel[]>;
/**
 * @param {TModelKey<typeof Camera>[]} attributes
 */
export function getAllOnlineCamerasAttrsOnly(attributes: TModelKey<typeof Camera>[]): Promise<import("../../models/Camera").TModel[]>;
/**
 * @param {string} cameraId
 */
export function removeCamera(cameraId: string): Promise<void>;
/**
 * @param {string} cameraId
 */
export function setActiveByCameraId(cameraId: string): Promise<void>;
import { Camera } from "../../models/all-models";
