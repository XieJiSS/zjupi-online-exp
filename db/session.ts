/** @format */

import * as assert from "assert";
import { getGlobalSequelizeInstance, hasAuthed } from "./connect";
assert(hasAuthed());

import type { Store } from "express-session";

import SequelizeStoreBinder from "connect-session-sequelize";

export function getSequelizeSessionStore(sessionStore: typeof Store) {
  const sequelize = getGlobalSequelizeInstance();
  assert(sequelize !== null);

  const SequelizeStore = SequelizeStoreBinder(sessionStore);
  return new SequelizeStore({
    db: sequelize,
  });
}
