/** @format */

// init == connect + sync

import assert from "assert";
import { _promise, hasAuthed } from "./connect";

async function initDB() {
  await _promise;
  assert(hasAuthed(), "Failed to connect to database.");

  await require("./sync")();
}

module.exports = initDB;
