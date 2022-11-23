// @ts-check

import assert from "assert";
import { getGlobalSequelizeInstance, hasAuthed } from "db/connect";
assert(hasAuthed());

import type { Store } from "express-session";

const sequelize = getGlobalSequelizeInstance();
import SequelizeStoreBinder from "connect-session-sequelize";

export function getSequelizeSessionStore(sessionStore: typeof Store) {
  const SequelizeStore = SequelizeStoreBinder(sessionStore);
  return new SequelizeStore({
    db: sequelize,
  });
}
