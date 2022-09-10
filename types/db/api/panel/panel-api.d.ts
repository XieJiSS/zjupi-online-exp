declare const _exports: {
    createStudent: typeof PanelStudentAPI.createStudent;
    getLinkByStudentId: typeof PanelStudentAPI.getLinkByStudentId;
    getLinkByStudentPhone: typeof PanelStudentAPI.getLinkByStudentPhone;
    getAllStudents: typeof PanelStudentAPI.getAllStudents;
    getAllStudentsAttrsOnly: typeof PanelStudentAPI.getAllStudentsAttrsOnly;
    getStudentById: typeof PanelStudentAPI.getStudentById;
    getStudentByIdAttrsOnly: typeof PanelStudentAPI.getStudentByIdAttrsOnly;
    getStudentByLinkId: typeof PanelStudentAPI.getStudentByLinkId;
    getStudentByLinkIdAttrsOnly: typeof PanelStudentAPI.getStudentByLinkIdAttrsOnly;
    getCameraByStudentId: typeof PanelStudentAPI.getCameraByStudentId;
    getCameraByStudentPhone: typeof PanelStudentAPI.getCameraByStudentPhone;
    getRemoteClientByStudentId: typeof PanelStudentAPI.getRemoteClientByStudentId;
    getRemoteClientByStudentPhone: typeof PanelStudentAPI.getRemoteClientByStudentPhone;
    setStudentLinkId: typeof PanelStudentAPI.setStudentLinkId;
    removeStudentById: typeof PanelStudentAPI.removeStudentById;
    getAdminCount: typeof PanelAdminAPI.getAdminCount;
    getAdminById: typeof PanelAdminAPI.getAdminById;
    getAdminByUsername: typeof PanelAdminAPI.getAdminByUsername;
    createAdmin: typeof PanelAdminAPI.createAdmin;
    isValidAdminCredentials: typeof PanelAdminAPI.isValidAdminCredentials;
    changeAdminPassword: typeof PanelAdminAPI.changeAdminPassword;
    createAccessLink: typeof AccessLinkAPI.createAccessLink;
    removeAccessLink: typeof AccessLinkAPI.removeAccessLink;
    assignCameraToLink: typeof AccessLinkAPI.assignCameraToLink;
    removeCameraFromLink: typeof AccessLinkAPI.removeCameraFromLink;
    assignLinkToStudent: typeof AccessLinkAPI.assignLinkToStudent;
    removeLinkFromStudent: typeof AccessLinkAPI.removeLinkFromStudent;
    assignLinkToRemoteClient: typeof AccessLinkAPI.assignLinkToRemoteClient;
    getLinkById: typeof AccessLinkAPI.getLinkById;
    getLinkByIdAttrsOnly: typeof AccessLinkAPI.getLinkByIdAttrsOnly;
    getLinkByLinkPath: typeof AccessLinkAPI.getLinkByLinkPath;
    getLinkIfValidByLinkPath: typeof AccessLinkAPI.getLinkIfValidByLinkPath;
    getAllLinks: typeof AccessLinkAPI.getAllLinks;
    getAllLinksAttrsOnly: typeof AccessLinkAPI.getAllLinksAttrsOnly;
    getAllValidLinks: typeof AccessLinkAPI.getAllValidLinks;
    getAllValidLinksAttrsOnly: typeof AccessLinkAPI.getAllValidLinksAttrsOnly;
    invalidateLinkById: typeof AccessLinkAPI.invalidateLinkById;
    invalidateLinkByLinkPath: typeof AccessLinkAPI.invalidateLinkByLinkPath;
    revalidateLinkById: typeof AccessLinkAPI.revalidateLinkById;
    setValidTimeById: typeof AccessLinkAPI.setValidTimeById;
};
export = _exports;
import PanelStudentAPI = require("./panel-student-api");
import PanelAdminAPI = require("./panel-admin-api");
import AccessLinkAPI = require("./access-link-api");
