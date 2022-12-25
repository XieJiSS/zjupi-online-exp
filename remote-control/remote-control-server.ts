/** @format */

"use strict";

import { name as serverName } from "./config";

import assert from "assert";
import { hasAuthed } from "../db/connect";
assert(hasAuthed);

import express from "express";

export const app = express();

import getLogger from "../util/logger";
import { getPersistentLoggerUtil } from "../db/api/db-log-api";
const logger = getLogger(serverName);
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import sql from "../db/api/remote-control/remote-control-api";

import logRequest from "../util/logRequest";
app.use(logRequest(serverName, logger));

app.use(function verify(req, res, next) {
  if (req.headers["user-agent"]?.startsWith("RemoteControlClient/") && req.headers["x-real-ip"]) {
    next();
  } else {
    logger.warn("Invalid user agent or IP from", req.headers["x-real-ip"], ":", req.headers["user-agent"]);
    res.status(403).send("Forbidden");
  }
});

app.use(express.json());

/** /api/remote-control/clients */
export interface RemoteControlClientRespData {
  clientId: string;
  ip: string;
  lastActive: Date | null;
}
app.get("/api/remote-control/clients", async (_, res) => {
  logger.info("Listing all remote clients...");
  const data: RemoteControlClientRespData[] = await sql.getAllRemoteClientsAttrsOnly(["clientId", "ip", "lastActive"]);
  res.json({ success: true, message: "", data });
});

/** /api/remote-control/getUpdate/:clientId */
export interface RemoteControlGetUpdateRespData {
  id: number;
  command: string;
  args: string[];
}
app.get("/api/remote-control/getUpdate/:clientId", async (req, res) => {
  const clientId = req.params.clientId;
  logger.debug("getUpdate request received from client", clientId);
  const client = await sql.getRemoteClientById(clientId);
  if (client === null) {
    res.json({ success: false, message: "Client not registered" });
    return;
  }

  const runningCommands = await sql.getRemoteCommandsByClientIdAndStatus(clientId, ["running"]);
  for (const runningCommand of runningCommands) {
    await sql.setRemoteCommandStatus(clientId, runningCommand.commandId, "failed", "discarded by client");
  }

  const queuedCommands = await sql.getRemoteCommandsByClientIdAndStatus(clientId, ["queued"]);
  if (queuedCommands.length > 0) {
    const command = queuedCommands[0]!;
    await sql.setRemoteCommandStatus(clientId, command.commandId, "running");
    res.json({ success: true, message: "", data: command });
    return;
  } else {
    res.json({ success: true, message: "no update", update: null });
  }
  await sql.setActiveByRemoteClientId(req.params.clientId);
});

/** /api/remote-control/rejectUpdate */
export interface RemoteControlRejectUpdateReqBody {
  clientId: string;
  commandId: number;
  reportedResult: string;
}
app.post("/api/remote-control/rejectUpdate", async (req, res) => {
  const { clientId, commandId, reportedResult }: RemoteControlRejectUpdateReqBody = req.body;
  logger.info("rejectUpdate received from", clientId, "for command", commandId, "with result", reportedResult);
  if (typeof clientId !== "string" || typeof commandId !== "number") {
    res.json({ success: false, message: "Malformed request" });
    return;
  }
  const client = await sql.getRemoteClientById(clientId);
  if (client === null) {
    res.json({ success: false, message: "Client not registered" });
    return;
  }
  const success = await sql.setRemoteCommandStatus(clientId, commandId, "failed", reportedResult);
  if (!success) {
    res.json({ success: false, message: "Failed to set command status" });
    return;
  }
  res.json({ success: true, message: "" });
  await sql.setActiveByRemoteClientId(clientId);
});

/** /api/remote-control/resolveUpdate */
export interface RemoteControlResolveUpdateReqBody {
  clientId: string;
  commandId: number;
}
app.post("/api/remote-control/resolveUpdate", async (req, res) => {
  const { clientId, commandId }: RemoteControlResolveUpdateReqBody = req.body;
  logger.info("resolveUpdate received from", clientId, "for command", commandId);
  if (typeof clientId !== "string" || typeof commandId !== "number") {
    res.json({ success: false, message: "Malformed request" });
    return;
  }
  const client = await sql.getRemoteClientById(clientId);
  if (client === null) {
    res.json({ success: false, message: "Client not registered" });
    return;
  }
  const success = await sql.setRemoteCommandStatus(clientId, commandId, "finished");
  if (!success) {
    res.json({ success: false, message: "Failed to set command status" });
    return;
  }
  res.json({ success: true, message: "" });
  const command = await sql.getRemoteCommandByIds(clientId, commandId);
  if (!command) {
    logger.error("WTF command not found after setting status to finished?");
  } else {
    logger.info("command", commandId, "resolved in", command.reportedAt!.getTime() - command.createdAt.getTime(), "ms");
  }
  await sql.setActiveByRemoteClientId(clientId);
});

/** /api/remote-control/getAvailableClientId */
export interface RemoteControlGetAvailableClientIdRespData {
  clientId: string;
}
app.get("/api/remote-control/getAvailableClientId", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({ success: false, message: "Cannot determine IP" });
    return;
  }
  const clients = await sql.getAllRemoteClients();
  const existingClientIds = clients.map((client) => client.clientId);
  let clientId: string;
  do {
    clientId = sql.generateRandomClientId();
  } while (existingClientIds.includes(clientId));
  logger.info("Generated random client ID", clientId, "for ip", ip);
  const data: RemoteControlGetAvailableClientIdRespData = { clientId };
  res.json({
    success: true,
    message: "",
    data,
  });
});

/** /api/remote-control/registerClient */
export interface RemoteControlRegisterClientReqBody {
  clientId: string;
  password: string;
}
app.post("/api/remote-control/registerClient", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({ success: false, message: "Cannot determine IP" });
    return;
  }
  const { clientId, password }: RemoteControlRegisterClientReqBody = req.body;
  logger.info("registerClient", clientId, password, ip);
  const oldClient = await sql.getRemoteClientById(clientId);
  if (oldClient !== null) {
    if (ip === oldClient.ip) {
      res.json({ success: true, message: "Client already registered" });
    } else {
      res.json({ success: false, message: "Client already registered with different IP" });
      logger.error(`Client ${clientId} already registered with different IP (old=${oldClient.ip}, new=${ip})`);
    }
    return;
  }
  const client = await sql.createRemoteClient(clientId, password, ip);
  if (client !== null) {
    res.json({ success: true, message: "Client registered successfully" });
  } else {
    res.json({ success: false, message: "Client registration failed" });
  }
  await sql.setActiveByRemoteClientId(clientId);
});

/** /api/remote-control/updatePassword */
export interface RemoteControlSyncPasswordReqBody {
  clientId: string;
  password: string;
}
app.post("/api/remote-control/syncPassword", async (req, res) => {
  const ip = req.headers["x-real-ip"] ?? "";
  if (!ip || typeof ip !== "string" || ip.includes(", ")) {
    res.json({ success: false, message: "Cannot determine IP" });
    return;
  }
  const { clientId, password }: RemoteControlSyncPasswordReqBody = req.body;
  logger.info("updatePassword request from", clientId, password);
  const client = await sql.getRemoteClientById(clientId);
  if (typeof password !== "string" || !/^[a-zA-Z0-9]+$/.test(password) || password.length < 6) {
    res.json({ success: false, message: "Password format mismatch" });
    logger.error(`Client ${clientId} tried to update password with invalid password ${password}`);
    return;
  }
  if (client === null) {
    res.json({ success: false, message: "Client not registered" });
    return;
  }
  if (ip !== client.ip) {
    res.json({ success: false, message: "IP mismatch" });
    logger.error(`Client ${clientId} tried to update password with invalid IP ${ip} (expecting ${client.ip})`);
    return;
  }

  await sql.setRemoteClientPasswordById(clientId, password);
  logger.warn(`Client ${clientId} updated its password to ${password}`);

  res.json({ success: true, message: "Password changed" });

  await sql.setActiveByRemoteClientId(clientId);
});

async function autoPruneDeadRemoteClient() {
  const clients = await sql.getAllRemoteClients();
  for (const client of clients) {
    if (client.isDead) {
      logger.warn(`Client ${client.clientId} is probably dead. Removing it automatically...`);
      const commands = await sql.getRemoteCommandsByClientIdAndStatus(client.clientId, ["queued", "running"]);
      for (const cmd of commands) {
        await sql.setRemoteCommandStatus(client.clientId, cmd.commandId, "failed", "client is dead");
      }
      await sql.removeRemoteClientById(client.clientId);
    }
  }
}

async function autoUpdatePassword() {
  const clients = await sql.getAllRemoteClients();
  for (const client of clients) {
    const commands = await sql.getRemoteCommandsByClientIdAndStatus(client.clientId, ["queued", "running"]);
    let hasPendingUpdatePasswordCommand = false;
    for (const cmd of commands) {
      if (cmd.command === "updatePassword") {
        hasPendingUpdatePasswordCommand = true;
        break;
      }
    }
    if (hasPendingUpdatePasswordCommand) {
      logger.info(`autoUpdatePassword: Client ${client.clientId} already has pending updatePassword command, skipping`);
      continue;
    }
    const shouldUpdatePassword = client.passwordExpireAt.getTime() < Date.now();
    if (shouldUpdatePassword) {
      logger.info("Scheduling a password update for client", client.clientId);
      const command = await sql.createRemoteCommand(
        client.clientId,
        {
          command: "changePassword",
          explanation: `regenerate password of client ${client.clientId}`,
        },
        []
      );
      if (command === null) {
        logger.warn(`autoUpdatePassword: Failed to create changePassword command for client ${client.clientId}`);
      }
    }
  }
}

if (process.env["AUTO_PRUNE_DEAD_RCLIENT"] === "yes") {
  autoPruneDeadRemoteClient();
  setInterval(autoPruneDeadRemoteClient, 1000 * 60 * 3);
}

setInterval(autoUpdatePassword, 1000 * 60 * 10);

export { port, name, subdomain } from "./config";
