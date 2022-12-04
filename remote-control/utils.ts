/** @format */

import cp from "child_process";
import path from "path";
import { setTimeout as sleep } from "timers/promises";
import { promisify } from "util";
import type { TPromisify } from "../types/type-helper";

const spawn: TPromisify<typeof cp.spawn> = promisify(cp.spawn);

const HOST_IP = "127.0.0.1";

export async function startHbbServer() {
  await spawn(path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbs.exe"), ["-r", HOST_IP, "-R", HOST_IP], {
    detached: true,
    stdio: "ignore",
  });
  await sleep(1000);
  const proc = await spawn(path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbr.exe"), [], {
    windowsHide: true,
  });
  proc.unref();
}
