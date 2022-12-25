/** @format */

// init == connect + sync

import assert from "assert";
import { _promise, hasAuthed } from "./connect";

export async function initDB() {
  await _promise;
  assert(hasAuthed(), "Failed to connect to database.");

  const { syncDB } = await import("./sync");
  await syncDB();
}
