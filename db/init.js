// @ts-check
// connect + sync

const assert = require("assert");
const { _promise, hasAuthed } = require("./connect");

async function initDB() {
  await _promise;
  assert(hasAuthed(), "Failed to connect to database.");

  await require("./sync")();
}

module.exports = initDB;
