const RemoteClient = require("./RemoteClient");
const RemoteCommand = require("./RemoteCommand");
const AdminLog = require("./AdminLog");

require("./constraints");

module.exports = {
  RemoteClient,
  RemoteCommand,
  AdminLog,
  // Models in former arrays will be synced first. Sync order in the same array is not guaranteed.
  topoSortedModels: [[RemoteClient, AdminLog], [RemoteCommand]],
};
