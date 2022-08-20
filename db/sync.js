// @ts-check

const assert = require("assert");

const { hasAuthed } = require("./connect");
assert(hasAuthed());

async function syncDB() {
  const models = require("./models");
  const syncPromises = [];
  for (const model of models.topoSortedModels) {
    syncPromises.push(model.sync({ alter: true }));
  }
  await Promise.all(syncPromises);
}

module.exports = syncDB;
