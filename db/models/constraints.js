const RemoteClient = require("./RemoteClient");
const RemoteCommand = require("./RemoteCommand");

// @NOTE: Here, we'd like to keep RemoteClient and RemoteCommand as independent models,
// otherwise when removing dead clients their command records will also be removed.
// RemoteClient.hasMany(RemoteCommand, { foreignKey: "clientId" });
// RemoteCommand.belongsTo(RemoteClient, { foreignKey: "clientId" });
