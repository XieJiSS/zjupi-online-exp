/** @format */

import { config } from "dotenv";
config();

import assert from "assert";
assert(Number(process.versions.node.split(".")[0]) >= 15, "Node.js version >= 15.0.0 is required.");

import getLogger from "./util/logger";
const logger = getLogger("app-entrance");

import { getServers } from "./servers/all-servers";
import { startHbbServer } from "./remote-control/utils";

import asyncExitHook from "async-exit-hook";

async function main() {
  await (await import("./db/init")).initDB();

  const { getPersistentLoggerUtil } = await import("./db/api/db-log-api");
  logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
  logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));
  await logger.warn("The server is starting");

  asyncExitHook(async (done: () => void) => {
    const { gracefullyCloseDatabaseConnection } = await import("./db/connect");
    // we need to await this to make sure the warn log is written into db before we close db connection
    // this function do not throw, so no need to try-catch
    await logger.warn("The server is shutting down");
    try {
      await gracefullyCloseDatabaseConnection();
    } catch {}
    done();
  });

  startHbbServer();

  const servers = await getServers();
  for (const server of servers) {
    // @TODO: spawn servers in separate processes
    // @TODO: implement clusters
    server.app.listen(server.port, () => {
      logger.info(`Server ${server.name} listening on port ${server.port}`);
    });
  }
}

main();
