/** @format */

"use strict";

import * as assert from "assert";
import { hasAuthed } from "db/connect";
assert(hasAuthed);

import { port, name as serverName, subdomain } from "./config";
import express from "express";
const app = express();

import getLogger from "util/logger";
const logger = getLogger(serverName);
import { getPersistentLoggerUtil } from "db/api/db-log-api";
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import sql from "db/api/camera/camera-api";
import logRequest from "util/logRequest";

app.use(logRequest(serverName, logger));

app.use(function verify(req, res, next) {
  if (req.headers["user-agent"]?.startsWith("SmartCamera/") && req.headers["x-real-ip"]) {
    const ip = req.headers["x-real-ip"];
    if (typeof ip !== "string" || ip.includes(", ")) {
      logger.warn(`Invalid x-real-ip: ${ip} from ${req.socket.remoteAddress}`);
      res.json({ success: false, message: "Cannot determine IP" });
      return;
    }
    next();
  } else {
    logger.warn("Invalid user agent or IP from", req.headers["x-real-ip"], ":", req.headers["user-agent"]);
    res.status(403).send("Forbidden");
  }
});

app.use(express.json());

app.get("/api/camera/ping", async (req, res) => {
  const ip = req.headers["x-real-ip"] as string;

  logger.info("Got ping connection test from", ip);
  res.json({ success: true, message: "pong" });
});

/** /api/camera/register */
export interface CameraRegisterReqBody {
  cameraId: string;
}
app.post("/api/camera/register", async (req, res) => {
  const ip = req.headers["x-real-ip"] as string;

  const { cameraId }: CameraRegisterReqBody = req.body;
  logger.info("received registerCamera request of", cameraId, "whose IP is", ip);

  if (typeof cameraId !== "string") {
    res.json({ success: false, message: "Missing cameraId" });
    return;
  }

  const oldCamera = await sql.getCameraById(cameraId);
  if (oldCamera !== null) {
    if (ip === oldCamera.ip) {
      res.json({ success: true, message: "Camera already registered" });
    } else {
      res.json({ success: false, message: "Camera already registered with different IP" });
      logger.error(`Camera ${cameraId} already registered with different IP (old=${oldCamera.ip}, new=${ip})`);
    }
    return;
  }

  const camera = await sql.createCamera(cameraId, ip);
  if (camera !== null) {
    res.json({ success: true, message: "Camera registered successfully" });
  } else {
    res.json({ success: false, message: "Camera registration failed" });
  }

  await sql.setActiveByCameraId(cameraId);
});

/** /api/camera/heartbeat */
export interface CameraHeartbeatReqBody {
  cameraId: string;
}
app.post("/api/camera/heartbeat", async (req, res) => {
  const ip = req.headers["x-real-ip"] as string;

  const { cameraId }: CameraHeartbeatReqBody = req.body;
  logger.info("received heartbeat request of", cameraId, "whose IP is", ip);

  if (typeof cameraId !== "string") {
    res.json({ success: false, message: "Missing cameraId" });
    return;
  }

  const camera = await sql.getCameraById(cameraId);
  if (camera === null) {
    res.json({ success: false, message: "Camera not registered" });
    logger.error(`heartbeat: camera ${cameraId} not registered`);
    return;
  }
  if (camera.ip !== ip) {
    res.json({ success: false, message: "Camera IP mismatch" });
    logger.error(`heartbeat: camera ${cameraId} IP mismatch (old=${camera.ip}, new=${ip})`);
    return;
  }

  res.json({ success: true, message: "Heartbeat received" });

  await sql.setActiveByCameraId(cameraId);
});

/** /api/camera/reportError */
export interface CameraReportErrorReqBody {
  cameraId: string;
  summary: string;
  detail: string;
  timestamp: number;
}
app.post("/api/camera/reportError", async (req, res) => {
  const ip = req.headers["x-real-ip"] as string;

  const body: CameraReportErrorReqBody = req.body;
  const { cameraId, summary, detail, timestamp } = body;
  logger.info("received error report of", cameraId, "whose IP is", ip);

  if (typeof cameraId !== "string") {
    res.json({ success: false, message: "Missing cameraId" });
    return;
  }

  const camera = await sql.getCameraById(cameraId);
  if (camera === null) {
    res.json({ success: false, message: "Camera not registered" });
    logger.error(`error report: camera ${cameraId} not registered`);
    return;
  }
  if (camera.ip !== ip) {
    res.json({ success: false, message: "Camera IP mismatch" });
    logger.error(`error report: camera ${cameraId} IP mismatch (old=${camera.ip}, new=${ip})`);
    return;
  }

  await Promise.all([
    sql.setActiveByCameraId(cameraId),
    sql.appendCameraErrorReport(cameraId, { summary, detail, timestamp }),
  ]);

  res.json({ success: true, message: "Error report recorded" });
});

async function autoPruneDeadCamera() {
  const cameras = await sql.getAllCameras();
  for (const camera of cameras) {
    if (!camera.online) {
      logger.warn(`Camera ${camera.cameraId} is probably dead. Removing it automatically...`);
      await sql.removeCamera(camera.cameraId);
    }
  }
}
if (process.env["AUTO_PRUNE_DEAD_CAMERA"] === "yes") {
  autoPruneDeadCamera();
  setInterval(autoPruneDeadCamera, 1000 * 30);
}

export default {
  app,
  port,
  name: serverName,
  subdomain,
};
