export interface SaltHashPair {
    hash: string;
    salt: string;
}
declare function getAdminCount(): Promise<number>;
declare function getAdminByUsername(username: string): Promise<import("db/models/all-models").AdminModel>;
declare function getAdminById(adminId: number): Promise<import("db/models/all-models").AdminModel>;
declare function createAdmin(username: string, password: string): Promise<import("db/models/all-models").AdminModel>;
declare function isValidAdminCredentials(username: string, password: string): Promise<boolean>;
declare function changeAdminPassword(adminId: number, password: string): Promise<boolean>;
declare const _default: {
    getAdminCount: typeof getAdminCount;
    getAdminById: typeof getAdminById;
    getAdminByUsername: typeof getAdminByUsername;
    createAdmin: typeof createAdmin;
    isValidAdminCredentials: typeof isValidAdminCredentials;
    changeAdminPassword: typeof changeAdminPassword;
};
export default _default;
