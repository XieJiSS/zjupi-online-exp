declare const _exports: {
    generateRandomClientId: typeof RemoteControlAPI.generateRandomClientId;
    createRemoteCommand: typeof RemoteControlAPI.createRemoteCommand;
    getRemoteCommands: typeof RemoteControlAPI.getRemoteCommands;
    getRemoteCommandById: typeof RemoteControlAPI.getRemoteCommandById;
    getRemoteCommandsByClientId: typeof RemoteControlAPI.getRemoteCommandsByClientId;
    getRemoteCommandsByClientIdAndStatus: typeof RemoteControlAPI.getRemoteCommandsByClientIdAndStatus;
    setRemoteCommandStatus: typeof RemoteControlAPI.setRemoteCommandStatus;
    invalidateRemoteCommandByCommandType: typeof RemoteControlAPI.invalidateRemoteCommandByCommandType;
    createRemoteClient: typeof RemoteControlAPI.createRemoteClient;
    getAllRemoteClients: typeof RemoteControlAPI.getAllRemoteClients;
    getAllRemoteClientsWithLinks: typeof RemoteControlAPI.getAllRemoteClientsWithLinks;
    getRemoteClientById: typeof RemoteControlAPI.getRemoteClientById;
    getRemoteClientByIdAttrsOnly: typeof RemoteControlAPI.getRemoteClientByIdAttrsOnly;
    removeRemoteClientById: typeof RemoteControlAPI.removeRemoteClientById;
    setRemoteClientPasswordById: typeof RemoteControlAPI.setRemoteClientPasswordById;
    invalidatePasswordById: typeof RemoteControlAPI.invalidatePasswordById;
    setActiveByRemoteClientId: typeof RemoteControlAPI.setActiveByRemoteClientId;
    isRemoteClientActive: typeof RemoteControlAPI.isRemoteClientActive;
    createStudent: typeof import("./panel/panel-student-api").createStudent;
    getLinkByStudentId: typeof import("./panel/panel-student-api").getLinkByStudentId;
    getLinkByStudentPhone: typeof import("./panel/panel-student-api").getLinkByStudentPhone;
    getAllStudents: typeof import("./panel/panel-student-api").getAllStudents;
    getAllStudentsAttrsOnly: typeof import("./panel/panel-student-api").getAllStudentsAttrsOnly;
    getStudentById: typeof import("./panel/panel-student-api").getStudentById;
    getStudentByIdAttrsOnly: typeof import("./panel/panel-student-api").getStudentByIdAttrsOnly;
    getStudentByLinkId: typeof import("./panel/panel-student-api").getStudentByLinkId;
    getStudentByLinkIdAttrsOnly: typeof import("./panel/panel-student-api").getStudentByLinkIdAttrsOnly;
    getCameraByStudentId: typeof import("./panel/panel-student-api").getCameraByStudentId;
    getCameraByStudentPhone: typeof import("./panel/panel-student-api").getCameraByStudentPhone;
    getRemoteClientByStudentId: typeof import("./panel/panel-student-api").getRemoteClientByStudentId;
    getRemoteClientByStudentPhone: typeof import("./panel/panel-student-api").getRemoteClientByStudentPhone;
    setStudentLinkId: typeof import("./panel/panel-student-api").setStudentLinkId;
    removeStudentById: typeof import("./panel/panel-student-api").removeStudentById;
    getAdminCount: typeof import("./panel/panel-admin-api").getAdminCount;
    getAdminById: typeof import("./panel/panel-admin-api").getAdminById;
    getAdminByUsername: typeof import("./panel/panel-admin-api").getAdminByUsername;
    createAdmin: typeof import("./panel/panel-admin-api").createAdmin;
    isValidAdminCredentials: typeof import("./panel/panel-admin-api").isValidAdminCredentials;
    changeAdminPassword: typeof import("./panel/panel-admin-api").changeAdminPassword;
    createAccessLink: typeof import("./panel/access-link-api").createAccessLink;
    removeAccessLink: typeof import("./panel/access-link-api").removeAccessLink;
    assignCameraToLink: typeof import("./panel/access-link-api").assignCameraToLink;
    removeCameraFromLink: typeof import("./panel/access-link-api").removeCameraFromLink;
    assignLinkToStudent: typeof import("./panel/access-link-api").assignLinkToStudent;
    removeLinkFromStudent: typeof import("./panel/access-link-api").removeLinkFromStudent;
    assignLinkToRemoteClient: typeof import("./panel/access-link-api").assignLinkToRemoteClient;
    getLinkById: typeof import("./panel/access-link-api").getLinkById;
    getLinkByIdAttrsOnly: typeof import("./panel/access-link-api").getLinkByIdAttrsOnly;
    getLinkByLinkPath: typeof import("./panel/access-link-api").getLinkByLinkPath;
    getLinkIfValidByLinkPath: typeof import("./panel/access-link-api").getLinkIfValidByLinkPath;
    getAllLinks: typeof import("./panel/access-link-api").getAllLinks;
    getAllLinksAttrsOnly: typeof import("./panel/access-link-api").getAllLinksAttrsOnly;
    getAllValidLinks: typeof import("./panel/access-link-api").getAllValidLinks;
    getAllValidLinksAttrsOnly: typeof import("./panel/access-link-api").getAllValidLinksAttrsOnly;
    invalidateLinkById: typeof import("./panel/access-link-api").invalidateLinkById;
    invalidateLinkByLinkPath: typeof import("./panel/access-link-api").invalidateLinkByLinkPath;
    revalidateLinkById: typeof import("./panel/access-link-api").revalidateLinkById;
    setValidTimeById: typeof import("./panel/access-link-api").setValidTimeById;
    getCameraById: typeof CameraAPI.getCameraById;
    getCameraByIdAttrsOnly: typeof CameraAPI.getCameraByIdAttrsOnly;
    createCamera: typeof CameraAPI.createCamera;
    isCameraOnline: typeof CameraAPI.isCameraOnline;
    getAllCameras: typeof CameraAPI.getAllCameras;
    getAllCamerasAttrsOnly: typeof CameraAPI.getAllCamerasAttrsOnly;
    getAllOnlineCameras: typeof CameraAPI.getAllOnlineCameras;
    getAllOnlineCamerasAttrsOnly: typeof CameraAPI.getAllOnlineCamerasAttrsOnly;
    removeCamera: typeof CameraAPI.removeCamera;
    setActiveByCameraId: typeof CameraAPI.setActiveByCameraId;
};
export = _exports;
import RemoteControlAPI = require("./remote-control/remote-control-api");
import CameraAPI = require("./camera/camera-api");
