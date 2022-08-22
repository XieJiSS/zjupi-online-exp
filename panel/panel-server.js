// @ts-check
"use strict";

const { port, name: serverName, subdomain } = require("./config");

const assert = require("assert");
const { hasAuthed } = require("../db/connect");
assert(hasAuthed);

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const logger = require("../util/logger")(serverName);
const { hookLogUtil } = require("../db/api/admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

const sql = require("../db/api");

app.use(function logRequest(req, res, next) {
  const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
  logger.info(`IN  ${hash}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);
  res.once("finish", () => {
    logger.info(`OUT ${hash}:`, res.statusCode, res.getHeader("content-type"), res.getHeader("content-length"));
  });
  next(); // pass the control to the next middleware
});

app.use(express.json());
app.use(cookieParser());

app.get("/api/link/:link/all", async (req, res) => {
  const link = req.params.link;
  logger.info("getAll request received from client for", link);
  if (!link) {
    res.json({
      success: false,
      message: "Missing link",
    });
    return;
  }
  const linkObj = await sql.getLinkObjByLink(link);
  if (linkObj === null) {
    res.json({
      success: false,
      message: "Link not found",
    });
    return;
  }
  const clientId = linkObj.clientId;
  const cameraId = linkObj.cameraId;
  const [client, camera] = await Promise.all([
    sql.getRemoteClientById(clientId),
    cameraId ? sql.getCameraByCameraId(cameraId) : null,
  ]);
  const student = await sql.getStudentByLinkId(linkObj.linkId);
  res.json({
    success: true,
    message: "",
    data: {
      remoteClient: client && {
        id: client.clientId,
        password: client.password,
        relayAddr: client.ip,
      },
      camera: camera && {
        name: camera.cameraId,
        ip: camera.ip,
      },
      student: student && {
        name: student.name,
      },
    },
  });
});

// @TODO: router for login & management

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
