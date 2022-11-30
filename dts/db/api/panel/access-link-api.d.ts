import type { TExtractAttrsFromModel, TPartialModel, TPartialModelArr } from "types/type-helper";
import type { AccessLinkModel } from "db/models/all-models";
export interface AccessLinkValidTimeOptions {
    validAfter?: Date;
    validUntil?: Date;
}
declare function createAccessLink(clientId: string, options: Required<AccessLinkValidTimeOptions>): Promise<AccessLinkModel>;
declare function removeAccessLink(linkId: number): Promise<boolean>;
declare function assignCameraToLink(linkId: number, cameraId: string): Promise<boolean>;
declare function removeCameraFromLink(linkId: number): Promise<boolean>;
/**
 * @description assign a link to a remote client, while removing the link from the previous client
 */
declare function assignLinkToRemoteClient(linkId: number, clientId: string): Promise<boolean>;
declare function assignLinkToStudent(linkId: number, studentId: number): Promise<boolean>;
declare function removeLinkFromStudent(linkId: number): Promise<boolean>;
declare function getLinkById(linkId: number): Promise<AccessLinkModel>;
declare function getLinkByIdAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(linkId: number, attributes: Readonly<T[]>): Promise<TPartialModel<AccessLinkModel, T>>;
declare function getLinkByLinkPath(linkPath: string): Promise<AccessLinkModel>;
declare function getAllLinks(): Promise<AccessLinkModel[]>;
declare function getAllLinksAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<AccessLinkModel, T>>;
declare function getAllValidLinks(): Promise<AccessLinkModel[]>;
declare function getAllValidLinksAttrsOnly<T extends TExtractAttrsFromModel<AccessLinkModel>>(attributes: Readonly<T[]>): Promise<TPartialModelArr<AccessLinkModel, T>>;
declare function getLinkIfValidByLinkPath(linkPath: string): Promise<AccessLinkModel>;
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
