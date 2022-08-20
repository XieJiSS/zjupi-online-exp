const RemoteClient = require("./RemoteClient");
const RemoteCommand = require("./RemoteCommand");
const ErrorLog = require("./ErrorLog");

require("./constraints");

module.exports = {
  RemoteClient,
  RemoteCommand,
  ErrorLog,
  // Models in former arrays will be synced first. Sync order in the same array is not guaranteed.
  topoSortedModels: [[RemoteClient, ErrorLog], [RemoteCommand]],
};
