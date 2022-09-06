// @ts-check

const assert = require("assert");

const { hasAuthed } = require("./connect");
assert(hasAuthed());

async function syncDB() {
  const models = require("./models/all-models");
  for (const sameLevelModels of models.topoSortedModels) {
    const syncPromises = [];
    for (const model of sameLevelModels) {
      syncPromises.push(model.sync({ alter: true }));
    }
    await Promise.all(syncPromises);
  }
}

module.exports = syncDB;
