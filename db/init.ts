/** @format */

// init == connect + sync

import assert from "assert";
import { _promise, hasAuthed } from "./connect";

async function initDB() {
  await _promise;
  assert(hasAuthed(), "Failed to connect to database.");

  const { syncDB } = await import("./sync");
  await syncDB();
}

module.exports = initDB;
