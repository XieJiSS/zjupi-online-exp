// @ts-check

const assert = require("assert");
const { getGlobalSequelizeInstance, hasAuthed } = require("./connect");
assert(hasAuthed());

const sequelize = getGlobalSequelizeInstance();
const SequelizeStoreBinder = require("connect-session-sequelize");

/**
 * @param {typeof import("express-session").Store} sessionStore
 */
function getSequelizeSessionStore(sessionStore) {
  const SequelizeStore = SequelizeStoreBinder(sessionStore);
  return new SequelizeStore({
    db: sequelize,
  });
}

module.exports = {
  getSequelizeSessionStore,
};
