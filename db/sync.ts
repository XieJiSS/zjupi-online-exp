// @ts-check

import assert from "assert";
const { hasAuthed } = require("./connect");
assert(hasAuthed());

import type { Model } from "sequelize/types";
import { topoSortedModels } from "db/models/all-models";

export async function syncDB() {
  for (const sameLevelModels of topoSortedModels) {
    const syncPromises: Promise<Model<any, any>>[] = [];
    for (const model of sameLevelModels) {
      syncPromises.push(model.sync({ alter: true }));
    }
    await Promise.all(syncPromises);
  }
}
