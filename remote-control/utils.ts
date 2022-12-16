/** @format */

import os from "os";
import cp from "child_process";
import path from "path";
import { setTimeout as sleep } from "timers/promises";

import getLogger from "../util/logger";
const logger = getLogger("rustdesk-wrapper");

const HOST_IP = "127.0.0.1";

export async function startHbbServer() {
  if (os.platform() !== "win32") {
    logger.warn("Currently can't start rustdesk hbbs/hbbr server on non-Windows platforms.");
    return;
  }
  const hbbs = cp.spawn(
    path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbs.exe"),
    ["-r", HOST_IP, "-R", HOST_IP],
    {
      windowsHide: true,
      stdio: "ignore",
      detached: true,
    }
  );
  hbbs.unref();
  await sleep(1000);
  const hbbr = cp.spawn(path.join(__dirname, "..", "thirdparty", "rustdesk", "hbbr.exe"), [], {
    windowsHide: true,
    stdio: "ignore",
    detached: true,
  });
  hbbr.unref();
}
