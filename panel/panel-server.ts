"use strict";

import type {
  RemoteClientModelCtor,
  StudentModelCtor,
  CameraModelCtor,
  AccessLinkModelCtor,
} from "db/models/all-models";
import type { TExtractModelKeyUnion, TModelAttrsOnly, TExtractModel } from "types/type-helper";
import type { AccessLinkValidTimeOptions } from "db/api/panel/access-link-api";

export type RClientAttributes = TExtractModelKeyUnion<RemoteClientModelCtor>;
export type StudentAttributes = TExtractModelKeyUnion<StudentModelCtor>;
export type CameraAttributes = TExtractModelKeyUnion<CameraModelCtor>;
export type LinkAttributes = TExtractModelKeyUnion<AccessLinkModelCtor>;

import path from "path";
import assert from "assert";
import { promisify } from "util";

import { hasAuthed } from "../db/connect";
assert(hasAuthed);
assert(typeof process.env["SESSION_SECRET"] === "string" && process.env["SESSION_SECRET"].length > 0);

import { port, name as serverName, subdomain } from "./config";
import express from "express";
import session from "express-session";

const app = express();

import getLogger from "util/logger";
import dbLogApi from "db/api/db-log-api";
const logger = getLogger(serverName);
logger.error = dbLogApi.getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = dbLogApi.getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import sql from "db/api/all-apis";
import { getSequelizeSessionStore } from "db/session";

const CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 60 * 1000;

import logRequest from "util/logRequest";
app.use(logRequest(serverName, logger));

app.use(express.json());
app.use(
  session({
    secret: process.env["SESSION_SECRET"],
    store: getSequelizeSessionStore(session.Store),
    resave: false,
    saveUninitialized: false,
    // proxy: true,
    cookie: {
      // secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
    },
  })
);

/** /api/panel/access/:link */
export interface PanelAccessRespData {
  remoteClient: TModelAttrsOnly<RemoteClientModelCtor, "clientId" | "password" | "ip">;
  student: TModelAttrsOnly<StudentModelCtor, "name">;
  camera: TModelAttrsOnly<CameraModelCtor, "cameraId" | "ip">;
}
app.get("/api/panel/access/:link", async (req, res) => {
  const link = req.params.link;
  logger.info("getInfo request received from client for", link);
  if (!link) {
    res.json({ success: false, message: "Missing link field" });
    return;
  }
  const linkObj = await sql.getLinkIfValidByLinkPath(link);
  if (linkObj === null) {
    res.json({ success: false, message: "Link not found or invalid" });
    return;
  }
  const clientId = linkObj.clientId;
  const cameraId = linkObj.cameraId;
  const [client, camera] = await Promise.all([
    sql.getRemoteClientByIdAttrsOnly(clientId, ["clientId", "password", "ip"]),
    cameraId ? sql.getCameraByIdAttrsOnly(cameraId, ["cameraId", "ip", "lastActive"]) : null,
  ]);
  const student = await sql.getStudentByLinkIdAttrsOnly(linkObj.linkId, ["name"]);
  const data: PanelAccessRespData = {
    remoteClient: client,
    camera: camera,
    student: student,
  };
  res.json({
    success: true,
    message: "",
    data,
  });
});

/** /api/panel/admin/login */
export interface PanelAdminLoginReqBody {
  username: string;
  password: string;
}
app.post("/api/panel/admin/login", async (req, res) => {
  const { username, password }: PanelAdminLoginReqBody = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  logger.info("login request received from client for user", username);
  const success = await sql.isValidAdminCredentials(username, password);
  if (!success) {
    res.json({ success: false, message: "Wrong username/password" });
    return;
  }
  const session = req.session;
  session.username = username;
  await promisify(session.save.bind(session))();
  res.json({ success: true, message: "" });
});

// One should never use GET for logout, because GET can be triggered everywhere, e.g. by
// <img src="...">, or by <style>@import url("...")</style>, which broaden the scope of attack.
app.post("/api/panel/admin/logout", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  req.session.username = null;
  await promisify(req.session.save.bind(session))();
  res.json({ success: true, message: "" });
});

app.get("/api/panel/admin/isAdmin", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: true, message: "", data: { isAdmin: false } });
    return;
  }
  res.json({ success: true, message: "", data: { isAdmin: true } });
});

if (process.env["NODE_ENV"] === "development") {
  interface _PanelAdminRegisterReqBody {
    username: string;
    password: string;
  }
  app.post("/api/panel/admin/register", async (req, res) => {
    if ((await sql.getAdminCount()) > 0) {
      res.json({ success: false, message: "Admin already registered" });
      return;
    }

    const { username, password }: _PanelAdminRegisterReqBody = req.body;
    if (typeof username !== "string" || typeof password !== "string") {
      res.json({ success: false, message: "Missing necessary fields" });
      return;
    }

    logger.warn("admin register request received from client for user", username);

    const success = await sql.createAdmin(username, password);
    if (!success) {
      res.json({ success: false, message: "Username already exists" });
      return;
    }
    res.json({ success: true, message: "" });
  });
}

/** /api/panel/admin/student{s,/:id} */
type PanelAdminStudentRespData = TModelAttrsOnly<StudentModelCtor, "name" | "studentId" | "phone">;
app.get("/api/panel/admin/students", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ req.session;
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const data: PanelAdminStudentRespData[] = await sql.getAllStudentsAttrsOnly(["studentId", "name", "phone"]);
  res.json({
    success: true,
    message: "",
    data,
  });
});

app.get("/api/panel/admin/student/:id", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }

  const { id } = req.params;
  logger.info("getStudent request received from client for student", id);
  const studentId = Number(id);
  if (!Number.isSafeInteger(studentId)) {
    res.json({ success: false, message: "Invalid student id" });
    return;
  }

  const data: PanelAdminStudentRespData = await sql.getStudentByIdAttrsOnly(studentId, ["studentId", "name", "phone"]);
  if (!data) {
    res.json({ success: false, message: "Student not found" });
    return;
  }

  res.json({
    success: true,
    message: "",
    data,
  });
});

/** /api/panel/admin/student/add{One,Multi} */
export interface PanelAdminStudentAddReqBody {
  name: string;
  phone: string;
}
app.post("/api/panel/admin/student/addOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }

  const { name, phone }: PanelAdminStudentAddReqBody = req.body;
  if (typeof name !== "string" || typeof phone !== "string") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }

  logger.info("add student request received from client for student", name, phone);

  const student = await sql.createStudent(name, phone);
  if (!student) {
    res.json({ success: false, message: "Student already exists" });
    return;
  }

  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/student/addMulti", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }

  const studentInfoArr: PanelAdminStudentAddReqBody[] = req.body;

  const createStudentPromises: Promise<TExtractModel<StudentModelCtor> | null>[] = [];
  for (const { name, phone } of studentInfoArr) {
    if (typeof name !== "string" || typeof phone !== "string") {
      createStudentPromises.push(null);
      continue;
    }
    logger.info("add student request received from client for student", name, phone);
    createStudentPromises.push(sql.createStudent(name, phone));
  }

  await Promise.all(createStudentPromises);
  res.json({
    success: true,
    message: "",
  });
});

/** /api/panel/admin/student/delete{One,Multi}  */
export interface PanelAdminStudentDeleteReqBody {
  studentId: number;
}
app.post("/api/panel/admin/student/deleteOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { studentId }: PanelAdminStudentDeleteReqBody = req.body;
  if (typeof studentId !== "number") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  logger.info("delete student request received from client for student", studentId);
  if (!Number.isSafeInteger(studentId)) {
    logger.warn("student/deleteOne: student id", studentId, "is not a safe integer");
    res.json({ success: false, message: "Invalid student id" });
    return;
  }
  await sql.removeStudentById(studentId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/student/deleteMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ req.session;
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const deletestudentInfoArr = /** @type {DeleteStudentInfo[]} */ req.body;
  const deleteStudentPromises = [];
  for (const { studentId: id } of deletestudentInfoArr) {
    if (!Number.isSafeInteger(id)) {
      continue;
    }
    logger.info("delete student request received from client for student", id);
    deleteStudentPromises.push(sql.removeStudentById(id));
  }
  await Promise.all(deleteStudentPromises);
  res.json({ success: true, message: "" });
});

type PanelAdminLinksRespData = TExtractModel<AccessLinkModelCtor>[];
app.get("/api/panel/admin/links", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const data: PanelAdminLinksRespData = await sql.getAllValidLinks();
  res.json({
    success: true,
    message: "",
    data,
  });
});

type PanelAdminLinkRespData = TExtractModel<AccessLinkModelCtor>;
app.get("/api/panel/admin/link/:id", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { id } = req.params;
  const linkId = Number(id);
  if (!Number.isSafeInteger(linkId)) {
    res.json({ success: false, message: "Invalid link id" });
    return;
  }
  const data: PanelAdminLinkRespData = await sql.getLinkById(linkId);
  if (!data) {
    res.json({ success: false, message: "Link not found" });
    return;
  }
  res.json({
    success: true,
    message: "",
    data,
  });
});

/** /api/panel/admin/link/add{One,Multi} request Interface */
export interface PanelAdminLinkAddReqBody {
  clientId: string;
  validAfterTimeStamp: number;
  validUntilTimeStamp: number;
}
/** /api/panel/admin/link/add{One,Multi} response data */
type PanelAdminLinkAddRespData = TExtractModel<AccessLinkModelCtor>;
app.post("/api/panel/admin/link/addOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  let { clientId, validAfterTimeStamp, validUntilTimeStamp }: PanelAdminLinkAddReqBody = req.body;
  if (typeof clientId !== "string") {
    res.json({ success: false, message: "Missing necessary fields" });
  }
  validAfterTimeStamp = validAfterTimeStamp ?? Date.now();
  validUntilTimeStamp = validUntilTimeStamp ?? Date.now() + CLASS_DURATION;
  if (typeof validAfterTimeStamp !== "number" || typeof validUntilTimeStamp !== "number") {
    res.json({ success: false, message: "Invalid time stamp format" });
    return;
  }
  if (validAfterTimeStamp > validUntilTimeStamp) {
    res.json({ success: false, message: "Invalid time stamps" });
    return;
  }
  const data: PanelAdminLinkAddRespData = await sql.createAccessLink(clientId, {
    validAfter: new Date(validAfterTimeStamp),
    validUntil: new Date(validUntilTimeStamp),
  });
  res.json({ success: true, message: "", data });
});

app.post("/api/panel/admin/link/addMulti", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const addLinkInfos: PanelAdminLinkAddReqBody[] = req.body;
  const addLinkPromises: Promise<TExtractModel<AccessLinkModelCtor>>[] = [];
  for (let { clientId, validAfterTimeStamp, validUntilTimeStamp } of addLinkInfos) {
    if (typeof clientId !== "string") {
      addLinkPromises.push(null);
      continue;
    }
    validAfterTimeStamp = validAfterTimeStamp ?? Date.now();
    validUntilTimeStamp = validUntilTimeStamp ?? Date.now() + CLASS_DURATION;
    if (typeof validAfterTimeStamp !== "number" || typeof validUntilTimeStamp !== "number") {
      addLinkPromises.push(null);
      continue;
    }
    if (validAfterTimeStamp > validUntilTimeStamp) {
      addLinkPromises.push(null);
      continue;
    }
    addLinkPromises.push(
      sql.createAccessLink(clientId, {
        validAfter: new Date(validAfterTimeStamp),
        validUntil: new Date(validUntilTimeStamp),
      })
    );
  }
  const data: PanelAdminLinkAddRespData[] = await Promise.all(addLinkPromises);
  res.json({ success: true, message: "", data });
});

/** /api/panel/admin/link/edit{One,Multi} request interface */
export interface PanelAdminLinkEditReqBody {
  linkId: number;
  shouldRevalidate: boolean;
  shouldInvalidate: boolean;
  validAfterTimeStamp?: number;
  validUntilTimeStamp?: number;
}
app.post("/api/panel/admin/link/editOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const {
    linkId,
    shouldRevalidate,
    shouldInvalidate,
    validAfterTimeStamp,
    validUntilTimeStamp,
  }: PanelAdminLinkEditReqBody = req.body;
  if (!Number.isSafeInteger(linkId) || typeof shouldInvalidate !== "boolean") {
    res.json({ success: false, message: "Invalid arguments" });
    return;
  }
  if (shouldInvalidate) {
    logger.info("invalidating link", linkId);
    await sql.invalidateLinkById(linkId);
  } else if (shouldRevalidate) {
    logger.info("revalidating link", linkId);
    const validUntil = validUntilTimeStamp ? new Date(validUntilTimeStamp) : new Date(Date.now() + CLASS_DURATION);
    await sql.revalidateLinkById(linkId, validUntil);
  } else {
    if (typeof validAfterTimeStamp === "number" && !Number.isSafeInteger(validAfterTimeStamp)) {
      res.json({ success: false, message: "Invalid argument format" });
      return;
    }
    if (typeof validUntilTimeStamp === "number" && !Number.isSafeInteger(validUntilTimeStamp)) {
      res.json({ success: false, message: "Invalid argument format" });
      return;
    }
    if (!validAfterTimeStamp && !validUntilTimeStamp) {
      res.json({ success: false, message: "Please provide at least one timestamp" });
      return;
    }
    if (validAfterTimeStamp && validUntilTimeStamp && validAfterTimeStamp > validUntilTimeStamp) {
      res.json({ success: false, message: "validAfterTimeStamp is greater than validUntilTimeStamp" });
      return;
    }
    const options: AccessLinkValidTimeOptions = {};
    if (typeof validAfterTimeStamp === "number") {
      options.validAfter = new Date(validAfterTimeStamp);
    }
    if (typeof validUntilTimeStamp === "number") {
      options.validUntil = new Date(validUntilTimeStamp);
    }
    logger.info("setting valid time of link", linkId, "to range:", options);
    await sql.setValidTimeById(linkId, options);
  }
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/link/editMulti", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const editInfos: PanelAdminLinkEditReqBody[] = req.body;
  const editPromises: Promise<boolean>[] = [];
  for (const { linkId, shouldRevalidate, shouldInvalidate, validAfterTimeStamp, validUntilTimeStamp } of editInfos) {
    if (!Number.isSafeInteger(linkId) || typeof shouldInvalidate !== "boolean") {
      continue;
    }
    if (shouldInvalidate) {
      logger.info("invalidating link", linkId);
      editPromises.push(sql.invalidateLinkById(linkId));
    } else if (shouldRevalidate) {
      logger.info("revalidating link", linkId);
      const validUntil = validUntilTimeStamp ? new Date(validUntilTimeStamp) : new Date(Date.now() + CLASS_DURATION);
      editPromises.push(sql.revalidateLinkById(linkId, validUntil));
    } else {
      if (typeof validAfterTimeStamp === "number" && !Number.isSafeInteger(validAfterTimeStamp)) {
        continue;
      }
      if (typeof validUntilTimeStamp === "number" && !Number.isSafeInteger(validUntilTimeStamp)) {
        continue;
      }
      if (!validAfterTimeStamp && !validUntilTimeStamp) {
        continue;
      }
      if (validAfterTimeStamp && validUntilTimeStamp && validAfterTimeStamp > validUntilTimeStamp) {
        continue;
      }
      const options: AccessLinkValidTimeOptions = {};
      if (typeof validAfterTimeStamp === "number") {
        options.validAfter = new Date(validAfterTimeStamp);
      }
      if (typeof validUntilTimeStamp === "number") {
        options.validUntil = new Date(validUntilTimeStamp);
      }
      logger.info("setting valid time of link", linkId, "to range:", options);
      editPromises.push(sql.setValidTimeById(linkId, options));
    }
  }
  await Promise.all(editPromises);
  res.json({ success: true, message: "" });
});

/** /api/panel/admin/link/assignToStudent{One,Multi} request interface */
export interface PanelAdminLinkAssignToStudentReqBody {
  linkId: number;
  studentId: number;
}
app.post("/api/panel/admin/link/assignToStudentOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { linkId, studentId }: PanelAdminLinkAssignToStudentReqBody = req.body;
  if (typeof linkId !== "number" || !Number.isSafeInteger(linkId) || typeof studentId !== "number") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  await sql.assignLinkToStudent(linkId, studentId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/link/assignToStudentMulti", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const linkAssignInfos: PanelAdminLinkAssignToStudentReqBody[] = req.body;
  logger.info("assigning links to students", linkAssignInfos);
  const assignPromises: Promise<boolean>[] = [];
  for (const { linkId, studentId } of linkAssignInfos) {
    if (typeof linkId !== "number" || !Number.isSafeInteger(linkId) || typeof studentId !== "number") {
      continue;
    }
    assignPromises.push(sql.assignLinkToStudent(linkId, studentId));
  }
  try {
    await Promise.all(assignPromises);
    res.json({ success: true, message: "" });
  } catch (e) {
    logger.error("Error while assigning links to students:", e.message);
    res.json({ success: false, message: e.message });
  }
});

/** /api/panel/admin/link/delete{One,Multi} request interface */
export interface PanelAdminLinkDeleteReqBody {
  linkId: number;
}
app.post("/api/panel/admin/link/deleteOne", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { linkId }: PanelAdminLinkDeleteReqBody = req.body;
  if (typeof linkId !== "number" || !Number.isSafeInteger(linkId)) {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  await sql.removeAccessLink(linkId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/link/deleteMulti", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const deleteInfos: PanelAdminLinkDeleteReqBody[] = req.body;
  logger.info(
    "deleting multiple links:",
    deleteInfos.map(({ linkId }) => linkId)
  );
  const deletePromises: Promise<boolean>[] = [];
  for (const { linkId } of deleteInfos) {
    if (typeof linkId !== "number" || !Number.isSafeInteger(linkId)) {
      continue;
    }
    deletePromises.push(sql.removeAccessLink(linkId));
  }
  await Promise.all(deletePromises);
  res.json({ success: true, message: "" });
});

/** /api/panel/admin/rclient/:id */
export interface PanelAdminRClientRespData {
  rclient: TExtractModel<RemoteClientModelCtor>;
  link: TExtractModel<AccessLinkModelCtor>;
  student: TExtractModel<StudentModelCtor>;
  camera: TExtractModel<CameraModelCtor>;
}
app.get("/api/panel/admin/rclient/:id", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { id } = req.params;
  logger.info("getRemoteClient request received from client for client", id);
  const rclient = await sql.getRemoteClientById(id);
  if (!rclient) {
    res.json({ success: false, message: "No such client" });
    return;
  }
  const link = rclient.linkId ? await sql.getLinkById(rclient.linkId) : null;
  const student = link ? await sql.getStudentByLinkId(link.linkId) : null;
  const camera = link && link.cameraId ? await sql.getCameraById(link.cameraId) : null;
  const data: PanelAdminRClientRespData = { rclient, link, student, camera };
  res.json({
    success: true,
    message: "",
    data,
  });
});

app.get("/api/panel/admin/rclients", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const rclients = await sql.getAllRemoteClients();

  const data: PanelAdminRClientRespData[] = await Promise.all(
    rclients.map(async (rclient) => {
      const link = rclient.linkId ? await sql.getLinkById(rclient.linkId) : null;
      const student = link ? await sql.getStudentByLinkId(link.linkId) : null;
      const camera = link && link.cameraId ? await sql.getCameraById(link.cameraId) : null;
      return {
        rclient,
        link,
        student,
        camera,
      };
    })
  );
  res.json({
    success: true,
    message: "",
    data,
  });
});

/** /api/panel/admin/camera{s,/:id} */
type PanelAdminCameraRespData = TExtractModel<CameraModelCtor>;
app.get("/api/panel/admin/cameras", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ req.session;
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const data: PanelAdminCameraRespData[] = await sql.getAllCameras();
  res.json({
    success: true,
    message: "",
    data,
  });
});

app.get("/api/panel/admin/camera/:id", async (req, res) => {
  if (!req.session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { id } = req.params;
  logger.info("getCamera request received from client for camera", id);
  const data: PanelAdminCameraRespData = await sql.getCameraById(id);
  if (!data) {
    res.json({ success: false, message: "No such camera" });
    return;
  }
  res.json({
    success: true,
    message: "",
    data,
  });
});

app.use(express.static(path.join(__dirname, "panel-frontend", "dist")));

// note that outdated means validUntil < now
async function removeOutdatedLinksFromRClients() {
  const rclients = await sql.getAllRemoteClients();
  for (const rclient of rclients) {
    if (!rclient.linkId) {
      continue;
    }
    const link = await sql.getLinkById(rclient.linkId);
    if (link && link.validUntil < new Date()) {
      logger.info("removing outdated link", link.linkId, "on rclient", rclient.clientId, "from database");
      await sql.removeAccessLink(link.linkId);
    }
  }
}

setInterval(removeOutdatedLinksFromRClients, 1000 * 60 * 5);

export default {
  app,
  port,
  name: serverName,
  subdomain,
};