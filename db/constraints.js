// @ts-check

const assert = require("assert");
const { hasAuthed } = require("./connect");
assert(hasAuthed());

const RemoteClient = require("./models/RemoteClient");
const RemoteCommand = require("./models/RemoteCommand");

// @NOTE: Here, we'd like to keep RemoteClient and RemoteCommand as independent models,
// otherwise when removing dead clients their command records will also be removed.
// RemoteClient.hasMany(RemoteCommand, { foreignKey: "clientId" });
// RemoteCommand.belongsTo(RemoteClient, { foreignKey: "clientId" });

const AccessLink = require("./models/AccessLink");

RemoteClient.hasOne(AccessLink, {
  foreignKey: "clientId",
  onDelete: "cascade",
  hooks: true,
});
AccessLink.belongsTo(RemoteClient);
