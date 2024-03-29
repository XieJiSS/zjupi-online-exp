/** @format */
declare const _default: {
    createStudent: (name: string, phone: string) => Promise<import("../../models/Student").StudentModel | null>;
    getLinkByStudentId: (studentId: number) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    getLinkByStudentPhone: (phone: string) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    getAllStudents: () => Promise<import("../../models/Student").StudentModel[]>;
    getAllStudentsAttrsOnly: <T extends "name" | "linkId" | "studentId" | "phone">(attributes: readonly T[]) => Promise<import("../../../types/type-helper").TPartialModelArr<import("../../models/Student").StudentModel, T>>;
    getStudentById: (studentId: number) => Promise<import("../../models/Student").StudentModel | null>;
    getStudentByIdAttrsOnly: <T_1 extends "name" | "linkId" | "studentId" | "phone">(studentId: number, attributes: readonly T_1[]) => Promise<import("../../../types/type-helper").TPartialModel<import("../../models/Student").StudentModel, T_1> | null>;
    getStudentByLinkId: (linkId: number) => Promise<import("../../models/Student").StudentModel | null>;
    getStudentByLinkIdAttrsOnly: <T_2 extends "name" | "linkId" | "studentId" | "phone">(linkId: number, attributes: readonly T_2[]) => Promise<import("../../../types/type-helper").TPartialModel<import("../../models/Student").StudentModel, T_2> | null>;
    getCameraByStudentId: (studentId: number) => Promise<import("../../models/Camera").CameraModel | null>;
    getCameraByStudentPhone: (phone: string) => Promise<import("../../models/Camera").CameraModel | null>;
    getRemoteClientByStudentId: (studentId: number) => Promise<import("../../models/RemoteClient").RemoteClientModel | null>;
    getRemoteClientByStudentPhone: (phone: string) => Promise<import("../../models/RemoteClient").RemoteClientModel | null>;
    setStudentLinkId: (studentId: number, linkId: number) => Promise<import("../../models/Student").StudentModel | null>;
    removeStudentById: (studentId: number) => Promise<void>;
    getAdminCount: () => Promise<number>;
    getAdminById: (adminId: number) => Promise<import("../../models/Admin").AdminModel | null>;
    getAdminByUsername: (username: string) => Promise<import("../../models/Admin").AdminModel | null>;
    createAdmin: (username: string, password: string) => Promise<import("../../models/Admin").AdminModel | null>;
    isValidAdminCredentials: (username: string, password: string) => Promise<boolean>;
    changeAdminPassword: (adminId: number, password: string) => Promise<boolean>;
    createAccessLink: (clientId: string, options: Required<import("./access-link-api").AccessLinkValidTimeOptions>) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    removeAccessLink: (linkId: number) => Promise<boolean>;
    assignCameraToLink: (cameraId: string, linkId: number) => Promise<boolean>;
    removeCameraFromLink: (linkId: number) => Promise<boolean>;
    assignLinkToStudent: (linkId: number, studentId: number) => Promise<boolean>;
    removeLinkFromStudent: (linkId: number) => Promise<boolean>;
    assignLinkToRemoteClient: (linkId: number, clientId: string) => Promise<boolean>;
    getLinkById: (linkId: number) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    getLinkByIdAttrsOnly: <T_3 extends "createdAt" | "clientId" | "linkId" | "cameraId" | "linkPath" | "validAfter" | "validUntil" | "isValid">(linkId: number, attributes: readonly T_3[]) => Promise<import("../../../types/type-helper").TPartialModel<import("../../models/AccessLink").AccessLinkModel, T_3> | null>;
    getLinkByLinkPath: (linkPath: string) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    getLinkIfValidByLinkPath: (linkPath: string) => Promise<import("../../models/AccessLink").AccessLinkModel | null>;
    getAllLinks: () => Promise<import("../../models/AccessLink").AccessLinkModel[]>;
    getAllLinksAttrsOnly: <T_4 extends "createdAt" | "clientId" | "linkId" | "cameraId" | "linkPath" | "validAfter" | "validUntil" | "isValid">(attributes: readonly T_4[]) => Promise<import("../../../types/type-helper").TPartialModelArr<import("../../models/AccessLink").AccessLinkModel, T_4>>;
    getAllValidLinks: () => Promise<import("../../models/AccessLink").AccessLinkModel[]>;
    getAllValidLinksAttrsOnly: <T_5 extends "createdAt" | "clientId" | "linkId" | "cameraId" | "linkPath" | "validAfter" | "validUntil" | "isValid">(attributes: readonly T_5[]) => Promise<import("../../../types/type-helper").TPartialModelArr<import("../../models/AccessLink").AccessLinkModel, T_5>>;
    invalidateLinkById: (linkId: number) => Promise<boolean>;
    invalidateLinkByLinkPath: (linkPath: string) => Promise<boolean>;
    revalidateLinkById: (linkId: number, validUntil: Date) => Promise<boolean>;
    setValidTimeById: (linkId: number, options: import("./access-link-api").AccessLinkValidTimeOptions) => Promise<boolean>;
};
export default _default;
