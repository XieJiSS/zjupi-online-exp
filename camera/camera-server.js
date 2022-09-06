// @ts-check
"use strict";

const { port, name: serverName, subdomain } = require("./config");

const assert = require("assert");
const { hasAuthed } = require("../db/connect");
assert(hasAuthed);

const express = require("express");
const app = express();

const logger = require("../util/logger")(serverName);
const { hookLogUtil } = require("../db/api/admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

const sql = require("../db/api/camera/camera-api");

app.use(function logRequest(req, res, next) {
  const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
  logger.info(`IN  ${hash}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);
  res.once("finish", () => {
    logger.info(`OUT ${hash}:`, res.statusCode, res.getHeader("content-type"), res.getHeader("content-length"));
  });
  next(); // pass the control to the next middleware
});

app.use(function verify(req, res, next) {
  if (req.headers["user-agent"]?.startsWith("SmartCamera/") && req.headers["x-real-ip"]) {
    next();
  } else {
    logger.warn("Invalid user agent or IP from", req.headers["x-real-ip"], ":", req.headers["user-agent"]);
    res.status(403).send("Forbidden");
  }
});

app.use(express.json());

app.post("/api/camera/registerCamera", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  const { cameraId } = req.body;
  logger.info("registerCamera", cameraId, ip);
  const oldCamera = await sql.getCameraById(cameraId);
  if (oldCamera !== null) {
    if (ip === oldCamera.ip) {
      res.json({
        success: true,
        message: "Camera already registered",
      });
    } else {
      res.json({
        success: false,
        message: "Camera already registered with different IP",
      });
      logger.error(`Camera ${cameraId} already registered with different IP (old=${oldCamera.ip}, new=${ip})`);
    }
    return;
  }
  const camera = await sql.createCamera(cameraId, ip);
  if (camera !== null) {
    res.json({
      success: true,
      message: "Camera registered successfully",
    });
  } else {
    res.json({
      success: false,
      message: "Camera registration failed",
    });
  }
  await sql.setActiveByCameraId(cameraId);
});

// @TODO: command forwarding

async function autoPruneDeadCamera() {
  const cameras = await sql.getAllCameras();
  for (const camera of cameras) {
    if (!camera.online) {
      logger.warn(`Camera ${camera.cameraId} is probably dead. Removing it automatically...`);
      await sql.removeCamera(camera.cameraId);
      // @REVIEW: this may get executed during command forwarding, ensure no race-condition can happen
    }
  }
}
if (process.env["AUTO_PRUNE_DEAD_CAMERA"] === "yes") {
  autoPruneDeadCamera();
  setInterval(autoPruneDeadCamera, 1000 * 60 * 3);
}

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
