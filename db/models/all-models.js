// @ts-check

const Session = require("./Session"); // will be used by express-session
const RemoteClient = require("./RemoteClient");
const RemoteCommand = require("./RemoteCommand");
const Camera = require("./Camera");
const Admin = require("./Admin");
const Student = require("./Student");
const AccessLink = require("./AccessLink");
const AdminLog = require("./AdminLog");

require("../constraints");

module.exports = {
  // we are not exporting Session here because it shouldn't be manipulated by hand
  RemoteClient,
  RemoteCommand,
  Camera,
  Admin,
  Student,
  AccessLink,
  AdminLog,
  // Models in former arrays will be synced first. Sync order in the same array is not guaranteed.
  // This is mainly used to avoid alter failures caused by associations between Models, as specified
  // in ./constraints.js.
  topoSortedModels: [[Session], [RemoteClient, RemoteCommand, Camera, Admin, Student, AdminLog], [AccessLink]],
};
