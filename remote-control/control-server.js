// @ts-check

const { port, name: serverName, subdomain } = require("./config");

const assert = require("assert");
const { hasAuthed } = require("../db/connect");
assert(hasAuthed);

const express = require("express");
const app = express();

const logger = require("../util/logger")(serverName);
const sql = require("../db/api/remote-control");

app.use(function logRequest(req, res, next) {
  const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
  logger.debug(`IN  ${hash}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);
  next(); // pass the control to the next middleware
  logger.debug(`OUT ${hash}: ${res.statusCode} ${res.getHeader("content-type")} ${res.getHeader("content-length")}B`);
});

app.use(function verify(req, res, next) {
  if (req.headers["user-agent"]?.startsWith("RemoteControlClient/") && req.headers["x-real-ip"]) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
});

app.use(express.json());

app.get("/api/remote-control/clients", async (req, res) => {
  const clients = await sql.getRemoteClients();
  // filter out password from results
  /**
   * @type {{ clientId: string, ip: string, lastActive: number | null }[]}
   */
  const result = clients.map(({ clientId, ip, lastActive }) => ({ clientId, ip, lastActive }));
  res.json(result);
});

app.get("/api/remote-control/getUpdate/:clientId", async (req, res) => {
  const client = await sql.getRemoteClientById(req.params.clientId);
  if (client === null) {
    res.json({
      success: false,
      message: "Client not registered",
    });
    return;
  }
  const shouldUpdatePassword = client.passwordExpireAt < Date.now();
  if (shouldUpdatePassword) {
    res.json({
      success: true,
      update: {
        command: "changePassword",
      },
    });
  } else {
    res.json({
      success: true,
      update: null,
    });
  }
  await sql.setActiveById(req.params.clientId);
});

app.post("/api/remote-control/registerClient", async (req, res) => {
  const { clientId, password } = req.body;
  if ((await sql.getRemoteClientById(clientId)) !== null) {
    res.json({
      success: false,
      message: "Client already registered",
    });
    return;
  }
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  await sql.createRemoteClient(clientId, password, ip, true);
  res.json({
    success: true,
    message: "Client registered successfully",
  });
});

app.post("/api/remote-control/changePassword", async (req, res) => {
  const { clientId, password } = req.body;
  const client = await sql.getRemoteClientById(clientId);
  if (typeof password !== "string" || !/^[a-zA-Z0-9]$/.test(password) || password.length < 6) {
    res.json({
      success: false,
      message: "Password format mismatch",
    });
    return;
  }
  if (client === null) {
    res.json({
      success: false,
      message: "Client not registered",
    });
    return;
  }
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  if (client.ip !== ip) {
    res.json({
      success: false,
      message: "Client IP changed. Please re-register",
    });
    return;
  }
  await sql.updatePasswordById(clientId, password);
  res.json({
    success: true,
    message: "Password changed",
  });
});

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
