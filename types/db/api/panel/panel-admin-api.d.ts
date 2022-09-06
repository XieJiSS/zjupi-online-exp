export type SaltHashPair = {
    hash: string;
    salt: string;
};
export function getAdminCount(): Promise<number>;
/**
 * @param {number} adminId
 */
export function getAdminById(adminId: number): Promise<import("../../models/Admin").TModel>;
/**
 * @param {string} username
 */
export function getAdminByUsername(username: string): Promise<import("../../models/Admin").TModel>;
/**
 * @param {string} username
 * @param {string} password
 */
export function createAdmin(username: string, password: string): Promise<import("../../models/Admin").TModel>;
/**
 * @param {string} username
 * @param {string} password
 */
export function isValidAdminCredentials(username: string, password: string): Promise<boolean>;
/**
 * @param {number} adminId
 * @param {string} password
 */
export function changeAdminPassword(adminId: number, password: string): Promise<boolean>;
