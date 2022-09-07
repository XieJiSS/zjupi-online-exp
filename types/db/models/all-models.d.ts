import RemoteClient = require("./RemoteClient");
import RemoteCommand = require("./RemoteCommand");
import Camera = require("./Camera");
import Admin = require("./Admin");
import Student = require("./Student");
import AccessLink = require("./AccessLink");
import AdminLog = require("./AdminLog");
import Session = require("./Session");
export declare const topoSortedModels: (import("sequelize/types").ModelCtor<Session.TModel>[] | (import("sequelize/types").ModelCtor<RemoteClient.TModel> | import("sequelize/types").ModelCtor<RemoteCommand.TModel> | import("sequelize/types").ModelCtor<Camera.TModel> | import("sequelize/types").ModelCtor<Admin.TModel> | import("sequelize/types").ModelCtor<Student.TModel> | import("sequelize/types").ModelCtor<AdminLog.TModel>)[] | import("sequelize/types").ModelCtor<AccessLink.TModel>[])[];
export { RemoteClient, RemoteCommand, Camera, Admin, Student, AccessLink, AdminLog };