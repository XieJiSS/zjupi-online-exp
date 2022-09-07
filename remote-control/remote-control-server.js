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

const sql = require("../db/api/remote-control/remote-control-api");

app.use(function logRequest(req, res, next) {
  const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
  logger.info(`IN  ${hash}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);
  res.once("finish", () => {
    logger.info(`OUT ${hash}:`, res.statusCode, res.getHeader("content-type"), res.getHeader("content-length"));
  });
  next(); // pass the control to the next middleware
});

app.use(function verify(req, res, next) {
  if (req.headers["user-agent"]?.startsWith("RemoteControlClient/") && req.headers["x-real-ip"]) {
    next();
  } else {
    logger.warn("Invalid user agent or IP from", req.headers["x-real-ip"], ":", req.headers["user-agent"]);
    res.status(403).send("Forbidden");
  }
});

app.use(express.json());

app.get("/api/remote-control/clients", async (req, res) => {
  logger.info("Listing all remote clients...");
  const clients = await sql.getAllRemoteClients();
  // filter out password from results
  /**
   * @type {{ clientId: string, ip: string, lastActive: number | null }[]}
   */
  const result = clients.map(({ clientId, ip, lastActive }) => ({
    clientId,
    ip,
    lastActive: lastActive && lastActive.getTime(),
  }));
  res.json(result);
});

app.get("/api/remote-control/getUpdate/:clientId", async (req, res) => {
  const clientId = req.params.clientId;
  logger.debug("getUpdate request received from client", clientId);
  const client = await sql.getRemoteClientById(clientId);
  if (client === null) {
    res.json({
      success: false,
      message: "Client not registered",
    });
    return;
  }
  const shouldUpdatePassword = client.passwordExpireAt.getTime() < Date.now() || client.nextPassword !== null;
  if (shouldUpdatePassword) {
    logger.info("Attempting to command a password update to client", clientId);
    /**
     * @type {string[]}
     */
    let args = [];
    if (client.nextPassword) args = [client.nextPassword];
    await sql.invalidateRemoteCommandByCommandType(clientId, "changePassword");
    const command = await sql.createRemoteCommand(
      clientId,
      {
        command: "changePassword",
        displayText: `change password to ${args[0] || "random password"}`,
      },
      args
    );
    if (command === null) {
      res.json({
        success: false,
        message: "Failed to create command",
      });
      return;
    }
    res.json({
      success: true,
      message: "update needed",
      update: {
        id: command.commandId,
        command: "changePassword",
        args,
      },
    });
  } else {
    res.json({
      success: true,
      message: "no update",
      update: null,
    });
  }
  await sql.setActiveByRemoteClientId(req.params.clientId);
});

app.post("/api/remote-control/rejectUpdate", async (req, res) => {
  const { clientId, commandId, reportedResult } = req.body;
  logger.info("rejectUpdate received from", clientId, "for command", commandId, "with result", reportedResult);
  if (typeof clientId !== "string" || typeof commandId !== "number") {
    res.json({
      success: false,
      message: "Malformed request",
    });
    return;
  }
  const client = await sql.getRemoteClientById(clientId);
  if (client === null) {
    res.json({
      success: false,
      message: "Client not registered",
    });
    return;
  }
  const success = await sql.setRemoteCommandStatus(clientId, commandId, "failed", reportedResult);
  if (!success) {
    res.json({
      success: false,
      message: "Failed to set command status",
    });
    return;
  }
  await sql.setActiveByRemoteClientId(clientId);
});

app.get("/api/remote-control/getRandomAvailableClientId", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  const clients = await sql.getAllRemoteClients();
  const existingClientIds = clients.map((client) => client.clientId);
  let clientId;
  do {
    clientId = sql.generateRandomClientId();
  } while (existingClientIds.includes(clientId));
  logger.info("Generated random client ID", clientId, "for ip", ip);
  res.json({
    success: true,
    message: "",
    data: {
      clientId,
    },
  });
});

app.post("/api/remote-control/registerClient", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  const { clientId, password } = req.body;
  logger.info("registerClient", clientId, password, ip);
  const oldClient = await sql.getRemoteClientById(clientId);
  if (oldClient !== null) {
    if (ip === oldClient.ip) {
      res.json({
        success: true,
        message: "Client already registered",
      });
    } else {
      res.json({
        success: false,
        message: "Client already registered with different IP",
      });
      logger.error(`Client ${clientId} already registered with different IP (old=${oldClient.ip}, new=${ip})`);
    }
    return;
  }
  const client = await sql.createRemoteClient(clientId, password, ip);
  if (client !== null) {
    res.json({
      success: true,
      message: "Client registered successfully",
    });
  } else {
    res.json({
      success: false,
      message: "Client registration failed",
    });
  }
  await sql.setActiveByRemoteClientId(clientId);
});

app.post("/api/remote-control/updatePassword", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({
      success: false,
      message: "Cannot determine IP",
    });
    return;
  }
  const { clientId, commandId, password } = req.body;
  logger.info("updatePassword request from", clientId, commandId, password);
  const client = await sql.getRemoteClientById(clientId);
  if (typeof password !== "string" || !/^[a-zA-Z0-9]+$/.test(password) || password.length < 6) {
    res.json({
      success: false,
      message: "Password format mismatch",
    });
    logger.error(`Client ${clientId} tried to update password with invalid password ${password}`);
    await sql.setRemoteCommandStatus(clientId, commandId, "failed", "client reported invalid password");
    return;
  }
  if (client === null) {
    res.json({
      success: false,
      message: "Client not registered",
    });
    return;
  }
  if (ip !== client.ip) {
    res.json({
      success: false,
      message: "IP mismatch",
    });
    logger.error(`Client ${clientId} tried to update password with invalid IP ${ip} (expecting ${client.ip})`);
    return;
  }
  if (typeof commandId === "number") {
    const command = await sql.getRemoteCommandById(clientId, commandId);
    if (command === null) {
      logger.error(`Client ${clientId} tried to update password with invalid command ${commandId}, rejected`);
      res.json({
        success: false,
        message: "Invalid commandId",
      });
      return;
    } else if (command.status !== "running") {
      logger.error(`Client ${clientId} tried to reuse obsolete command ${commandId} (is: ${command.status}), rejected`);
      res.json({
        success: false,
        message: "Obsolete commandId",
      });
      return;
    } else {
      logger.info(`Client ${clientId} has updated password to ${password}`);
      await sql.setRemoteClientPasswordById(clientId, password);
      res.json({
        success: true,
        message: "Password changed",
      });
      await Promise.all([
        sql.setRemoteCommandStatus(clientId, commandId, "finished", "password updated successfully"),
        sql.setActiveByRemoteClientId(clientId),
      ]);
      return;
    }
  } else {
    res.json({
      success: false,
      message: "Invalid commandId",
    });
  }
});

async function autoPruneDeadRemoteClient() {
  const clients = await sql.getAllRemoteClients();
  for (const client of clients) {
    if (client.isDead) {
      logger.warn(`Client ${client.clientId} is probably dead. Removing it automatically...`);
      await sql.removeRemoteClientById(client.clientId);
      const runningCommands = await sql.getRemoteCommandsByClientIdAndStatus(client.clientId, "running");
      for (const cmd of runningCommands) {
        sql.setRemoteCommandStatus(client.clientId, cmd.commandId, "failed", "client is dead");
      }
    }
  }
}
if (process.env["AUTO_PRUNE_DEAD_RCLIENT"] === "yes") {
  autoPruneDeadRemoteClient();
  setInterval(autoPruneDeadRemoteClient, 1000 * 60 * 3);
}

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
