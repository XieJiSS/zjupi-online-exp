// @ts-check
require("dotenv").config();

const assert = require("assert");
assert(Number(process.versions.node.split(".")[0]) >= 15, "Node.js version >= 15.0.0 is required.");

const logger = require("./util/logger")("main");

async function main() {
  await require("./db/init")();

  const servers = require("./servers");
  for (const server of servers) {
    server.app.listen(server.port, () => {
      logger.info(`Server ${server.name} listening on port ${server.port}`);
    });
  }
}

main();
