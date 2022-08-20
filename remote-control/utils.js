// @ts-check

const cp = require("child_process");
const path = require("path");
const { setTimeout: sleep } = require("timers/promises");
const { promisify } = require("util");

const spawn = promisify(cp.spawn);

const HOST_IP = "127.0.0.1";

async function startHbbServer() {
  await spawn(path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbs.exe"), ["-r", HOST_IP, "-R", HOST_IP], {
    detached: true,
    stdio: "ignore",
  });
  await sleep(1000);
  await spawn(path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbr.exe"), [], {
    detached: true,
    stdio: "ignore",
  });
}

module.exports = {
  startHbbServer,
};
