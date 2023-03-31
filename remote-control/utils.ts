/** @format */

import os from "os";
import cp from "child_process";
import path from "path";
import { setTimeout as sleep } from "timers/promises";

import getLogger from "../util/logger";
const logger = getLogger("rustdesk-wrapper");

const HOST_IP = process.env["HOST_IP"] ?? "127.0.0.1";

if (HOST_IP === "127.0.0.1") {
  console.log(
    "[WARN] HOST_IP is not set, using 127.0.0.1 as default. This may cause issues when accessing from remote devices."
  );
}

let dbLoggerInited = false;

let hbbServerStatusChecker: NodeJS.Timeout | null = null;
let restartHbbServerAttempt = 0;

export async function startHbbServer() {
  if (!dbLoggerInited) {
    const dbLogApi = await import("../db/api/db-log-api");
    logger.error = dbLogApi.getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
    logger.warn = dbLogApi.getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));
    dbLoggerInited = true;
  }

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

  hbbServerStatusChecker = setInterval(maintainHbbServer, 8000);
}

async function checkHbbServer(): Promise<boolean> {
  if (os.platform() !== "win32") {
    return false;
  }
  const hasHbbsPromise = new Promise<boolean>((resolve) => {
    cp.exec(
      "tasklist | findstr hbbs.exe",
      {
        windowsHide: true,
      },
      (err, stdout) => {
        if (err) {
          logger.warn("Error checking hbbs.exe status: ", err);
          resolve(false);
        }
        resolve(stdout.includes("hbbs.exe"));
      }
    );
  });
  const hasHbbrPromise = new Promise<boolean>((resolve) => {
    cp.exec(
      "tasklist | findstr hbbr.exe",
      {
        windowsHide: true,
      },
      (err, stdout) => {
        if (err) {
          logger.warn("Error checking hbbr.exe status: ", err);
          resolve(false);
        }
        resolve(stdout.includes("hbbr.exe"));
      }
    );
  });
  const [hasHbbs, hasHbbr] = await Promise.all([hasHbbsPromise, hasHbbrPromise]);
  if (!hasHbbs) {
    logger.warn("checkHbbServer: hbbs.exe is not running.");
  }
  if (!hasHbbr) {
    logger.warn("checkHbbServer: hbbr.exe is not running.");
  }
  return hasHbbs && hasHbbr;
}

async function maintainHbbServer() {
  if (os.platform() !== "win32") {
    return;
  }

  if (restartHbbServerAttempt > 5) {
    logger.error("maintainHbbServer: failed to restart hbbs/hbbr server for too many times");
    if (hbbServerStatusChecker) {
      clearInterval(hbbServerStatusChecker);
    }
    return;
  }

  const isRunning = await checkHbbServer();

  if (!isRunning) {
    logger.warn("maintainHbbServer: hbbs/hbbr server is not running, restarting...");
    startHbbServer();
    restartHbbServerAttempt += 1;
  } else {
    restartHbbServerAttempt = 0;
  }
}
