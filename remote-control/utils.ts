/** @format */

import cp from "child_process";
import path from "path";
import { setTimeout as sleep } from "timers/promises";
import { promisify } from "util";

const spawn = promisify(cp.spawn);

const HOST_IP = "127.0.0.1";

export async function startHbbServer() {
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
