/** @format */

import os from "os";
import { Sequelize } from "sequelize";
import getLogger from "../util/logger";
const dbConnectLogger = getLogger("db-connect");

const poolSize = Math.max(os.cpus().length - 1, 1);
dbConnectLogger.debug("Will set poolSize to", poolSize);

import asyncExitHook from "async-exit-hook";
asyncExitHook((done: () => void) => {
  dbConnectLogger.info("Gracefully shutting down database connection...");
  if (_sequelize !== null) {
    dbConnectLogger.debug("Waiting for database connection to be closed...");
    _sequelize.close().then(() => {
      dbConnectLogger.debug("Database connection closed.");
      done();
    });
  } else {
    done();
  }
});

const seqLogger = getLogger("sequelize");
let _sequelize: Sequelize | null = null;

export const _promise: Promise<Sequelize> = new Promise(async (resolve, reject) => {
  const sequelize = new Sequelize("db", "root", process.env["DB_MYSQL_PSWD"], {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    pool: {
      max: poolSize,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: (sql, timing) => seqLogger.debug.bind(seqLogger)(sql, "executed in", timing, "ms"),
  });
  try {
    await sequelize.authenticate();
  } catch (err) {
    reject(err);
  }

  dbConnectLogger.info("Successfully authenticated.");
  _sequelize = sequelize;
  resolve(sequelize);
});
export function hasAuthed() {
  return _sequelize !== null;
}
export function getGlobalSequelizeInstance() {
  return _sequelize;
}
