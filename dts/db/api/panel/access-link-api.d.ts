import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly } from "types/type-helper";
import type { AccessLinkModelCtor } from "db/models/all-models";
export interface AccessLinkValidTimeOptions {
    validAfter?: Date;
    validUntil?: Date;
}
declare function createAccessLink(clientId: string, options: Required<AccessLinkValidTimeOptions>): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function removeAccessLink(linkId: number): Promise<boolean>;
declare function assignCameraToLink(linkId: number, cameraId: string): Promise<boolean>;
declare function removeCameraFromLink(linkId: number): Promise<boolean>;
/**
 * @description assign a link to a remote client, while removing the link from the previous client
 */
declare function assignLinkToRemoteClient(linkId: number, clientId: string): Promise<boolean>;
declare function assignLinkToStudent(linkId: number, studentId: number): Promise<boolean>;
declare function removeLinkFromStudent(linkId: number): Promise<boolean>;
declare function getLinkById(linkId: number): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function getLinkByIdAttrsOnly<T extends TExtractModelKeyUnion<AccessLinkModelCtor>>(linkId: number, attributes: Readonly<T[]>): Promise<TModelAttrsOnly<AccessLinkModelCtor, T>>;
declare function getLinkByLinkPath(linkPath: string): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function getAllLinks(): Promise<import("../../models/AccessLink").AccessLinkModel[]>;
declare function getAllLinksAttrsOnly<T extends TExtractModelKeyUnion<AccessLinkModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<AccessLinkModelCtor, T>>;
declare function getAllValidLinks(): Promise<import("../../models/AccessLink").AccessLinkModel[]>;
declare function getAllValidLinksAttrsOnly<T extends TExtractModelKeyUnion<AccessLinkModelCtor>>(attributes: Readonly<T[]>): Promise<TModelListAttrsOnly<AccessLinkModelCtor, T>>;
declare function getLinkIfValidByLinkPath(linkPath: string): Promise<import("../../models/AccessLink").AccessLinkModel>;
declare function invalidateLinkById(linkId: number): Promise<boolean>;
declare function invalidateLinkByLinkPath(linkPath: string): Promise<boolean>;
declare function revalidateLinkById(linkId: number, validUntil: Date): Promise<boolean>;
declare function setValidTimeById(linkId: number, options: AccessLinkValidTimeOptions): Promise<boolean>;
declare const _default: {
    createAccessLink: typeof createAccessLink;
    removeAccessLink: typeof removeAccessLink;
    assignCameraToLink: typeof assignCameraToLink;
    removeCameraFromLink: typeof removeCameraFromLink;
    assignLinkToStudent: typeof assignLinkToStudent;
    removeLinkFromStudent: typeof removeLinkFromStudent;
    assignLinkToRemoteClient: typeof assignLinkToRemoteClient;
    getLinkById: typeof getLinkById;
    getLinkByIdAttrsOnly: typeof getLinkByIdAttrsOnly;
    getLinkByLinkPath: typeof getLinkByLinkPath;
    getLinkIfValidByLinkPath: typeof getLinkIfValidByLinkPath;
    getAllLinks: typeof getAllLinks;
    getAllLinksAttrsOnly: typeof getAllLinksAttrsOnly;
    getAllValidLinks: typeof getAllValidLinks;
    getAllValidLinksAttrsOnly: typeof getAllValidLinksAttrsOnly;
    invalidateLinkById: typeof invalidateLinkById;
    invalidateLinkByLinkPath: typeof invalidateLinkByLinkPath;
    revalidateLinkById: typeof revalidateLinkById;
    setValidTimeById: typeof setValidTimeById;
};
export default _default;
