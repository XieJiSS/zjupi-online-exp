/** @format */

import { config } from "dotenv";
config();

import * as assert from "assert";
assert(Number(process.versions.node.split(".")[0]) >= 15, "Node.js version >= 15.0.0 is required.");

import getLogger from "util/logger";
const logger = getLogger("app-entrance");

import { getServers } from "servers/all-servers";

async function main() {
  await require("db/init")();

  const servers = getServers();
  for (const server of servers) {
    // @TODO: spawn servers in separate processes
    // @TODO: implement clusters
    server.app.listen(server.port, () => {
      logger.info(`Server ${server.name} listening on port ${server.port}`);
    });
  }
}

main();
