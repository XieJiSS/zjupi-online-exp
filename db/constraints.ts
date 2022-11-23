import RemoteClient from "./models/RemoteClient";
import RemoteCommand from "./models/RemoteCommand";

// @NOTE: Here, we'd like to keep RemoteClient and RemoteCommand as independent models,
// otherwise when removing dead clients their command records will also be removed.
// RemoteClient.hasMany(RemoteCommand, { foreignKey: "clientId" });
// RemoteCommand.belongsTo(RemoteClient, { foreignKey: "clientId" });

import AccessLink from "./models/AccessLink";

RemoteClient.hasOne(AccessLink, {
  foreignKey: "clientId",
  onDelete: "cascade",
  hooks: true,
});
AccessLink.belongsTo(RemoteClient);

export default {};
