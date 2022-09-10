// @ts-check
"use strict";

const path = require("path");
const { promisify } = require("util");

const assert = require("assert");
const { hasAuthed } = require("../db/connect");
assert(hasAuthed);
assert(typeof process.env["SESSION_SECRET"] === "string" && process.env["SESSION_SECRET"].length > 0);

const { port, name: serverName, subdomain } = require("./config");
const express = require("express");
const session = require("express-session");
const app = express();

const logger = require("../util/logger")(serverName);
const { hookLogUtil } = require("../db/api/admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

const sql = require("../db/api/all-apis");

const CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 60 * 1000;

/**
 * @template T
 * @typedef {T extends (...args: any) => Promise<infer I> ? I : never} AsyncReturnType
 */
/**
 * @template U
 * @typedef {U extends Array<infer I> ? I : never} ArrayInnerType
 */
/**
 * @typedef {ArrayInnerType<Parameters<typeof sql.getRemoteClientByIdAttrsOnly>[1]>} RClientAttributes
 * @typedef {ArrayInnerType<Parameters<typeof sql.getStudentByIdAttrsOnly>[1]>} StudentAttributes
 * @typedef {ArrayInnerType<Parameters<typeof sql.getCameraByIdAttrsOnly>[1]>} CameraAttributes
 * @typedef {ArrayInnerType<Parameters<typeof sql.getLinkByIdAttrsOnly>[1]>} LinkAttributes
 */

app.use(function logRequest(req, res, next) {
  const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
  logger.info(`IN  ${hash}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);
  res.once("finish", () => {
    logger.info(`OUT ${hash}:`, res.statusCode, res.getHeader("content-type"), res.getHeader("content-length"));
  });
  next(); // pass the control to the next middleware
});

app.use(express.json());
app.use(
  session({
    secret: process.env["SESSION_SECRET"],
    store: require("../db/session").getSequelizeSessionStore(session.Store),
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
    sql.getRemoteClientById(clientId),
    cameraId ? sql.getCameraById(cameraId) : null,
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

/**
 * @typedef AdminSession
 * @prop {string | null} username
 */
/**
 * @typedef AdminLoginInfo /api/panel/admin/login request interface
 * @prop {string} username
 * @prop {string} password
 */
app.post("/api/panel/admin/login", async (req, res) => {
  const { username, password } = /** @type {AdminLoginInfo} */ (req.body);
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
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  session.username = username;
  await promisify(session.save.bind(session))();
  res.json({ success: true, message: "" });
});

// One should never use GET for logout, because GET can be triggered everywhere, e.g. by
// <img src="...">, or by <style>@import url("...")</style>, which broaden the scope of attack.
app.post("/api/panel/admin/logout", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  session.username = null;
  await promisify(session.save.bind(session))();
  res.json({ success: true, message: "" });
});

app.get("/api/panel/admin/isAdmin", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: true, message: "", data: { isAdmin: false } });
    return;
  }
  res.json({ success: true, message: "", data: { isAdmin: true } });
});

if (process.env["NODE_ENV"] === "development") {
  app.post("/api/panel/admin/register", async (req, res) => {
    if ((await sql.getAdminCount()) > 0) {
      res.json({ success: false, message: "Admin already registered" });
      return;
    }
    const { username, password } = req.body;
    if (typeof username !== "string" || typeof password !== "string") {
      res.json({ success: false, message: "Missing necessary fields" });
      return;
    }
    logger.warn("register request received from client for user", username);
    const success = await sql.createAdmin(username, password);
    if (!success) {
      res.json({ success: false, message: "Username already exists" });
      return;
    }
    res.json({ success: true, message: "" });
  });
}

/**
 * @typedef {AsyncReturnType<typeof sql.getStudentById>} StudentResponseData
 */
app.get("/api/panel/admin/students", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  /**
   * @type {StudentResponseData[]}
   */
  const students = await sql.getAllStudentsAttrsOnly(["studentId", "name", "phone"]);
  res.json({
    success: true,
    message: "",
    data: students,
  });
});

app.get("/api/panel/admin/student/:id", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
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
  /**
   * @type {StudentResponseData}
   */
  const student = await sql.getStudentById(studentId);
  if (!student) {
    res.json({ success: false, message: "Student not found" });
    return;
  }
  res.json({
    success: true,
    message: "",
    data: {
      studentId: student.studentId,
      name: student.name,
      phone: student.phone,
    },
  });
});

/**
 * @typedef AddStudentInfo /api/panel/admin/student/add{One,Multi} request interface
 * @prop {string} name
 * @prop {string} phone
 */
app.post("/api/panel/admin/student/addOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { name, phone } = /** @type {AddStudentInfo} */ (req.body);
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
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const studentInfos = /** @type {AddStudentInfo[]} */ (req.body);
  const createStudentPromises = [];
  for (const { name, phone } of studentInfos) {
    if (typeof name !== "string" || typeof phone !== "string") {
      createStudentPromises.push(null);
      continue;
    }
    logger.info("add student request received from client for student", name, phone);
    createStudentPromises.push(sql.createStudent(name, phone));
  }
  const students = await Promise.all(createStudentPromises);
  res.json({
    success: true,
    message: "",
    data: students,
  });
});

/**
 * @typedef DeleteStudentInfo /api/panel/admin/student/delete{One,Multi} request interface
 * @prop {number} studentId
 */
app.post("/api/panel/admin/student/deleteOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { studentId: id } = /** @type {DeleteStudentInfo} */ (req.body);
  if (typeof id !== "string") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  logger.info("delete student request received from client for student", id);
  const studentId = Number(id);
  if (!Number.isSafeInteger(studentId)) {
    logger.warn("student/deleteOne: student id", id, "cannot be parsed as a safe integer");
    res.json({ success: false, message: "Invalid student id" });
    return;
  }
  await sql.removeStudentById(studentId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/student/deleteMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const deleteStudentInfos = /** @type {DeleteStudentInfo[]} */ (req.body);
  const deleteStudentPromises = [];
  for (const { studentId: id } of deleteStudentInfos) {
    if (!Number.isSafeInteger(id)) {
      continue;
    }
    logger.info("delete student request received from client for student", id);
    deleteStudentPromises.push(sql.removeStudentById(id));
  }
  await Promise.all(deleteStudentPromises);
  res.json({ success: true, message: "" });
});

/**
 * @typedef {AsyncReturnType<typeof sql.getLinkById>} LinkResponseData
 */
app.get("/api/panel/admin/links", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  /**
   * @type {LinkResponseData[]}
   */
  const links = await sql.getAllValidLinks();
  res.json({
    success: true,
    message: "",
    data: links,
  });
});

app.get("/api/panel/admin/link/:id", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { id } = req.params;
  const linkId = Number(id);
  if (!Number.isSafeInteger(linkId)) {
    res.json({ success: false, message: "Invalid link id" });
    return;
  }
  /**
   * @type {LinkResponseData}
   */
  const link = await sql.getLinkById(linkId);
  if (!link) {
    res.json({ success: false, message: "Link not found" });
    return;
  }
  res.json({
    success: true,
    message: "",
    data: link,
  });
});

/**
 * @typedef AddLinkInfo /api/panel/admin/link/add{One,Multi} request Interface
 * @prop {string} clientId
 * @prop {number} validAfterTimeStamp
 * @prop {number} validUntilTimeStamp
 */
app.post("/api/panel/admin/link/addOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  let { clientId, validAfterTimeStamp, validUntilTimeStamp } = /** @type {AddLinkInfo} */ (req.body);
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
  const link = await sql.createAccessLink(clientId, {
    validAfter: new Date(validAfterTimeStamp),
    validUntil: new Date(validUntilTimeStamp),
  });
  res.json({ success: true, message: "", data: link });
});

app.post("/api/panel/admin/link/addMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const addLinkInfos = /** @type {AddLinkInfo[]} */ (req.body);
  const addLinkPromises = [];
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
  const links = await Promise.all(addLinkPromises);
  res.json({ success: true, message: "", data: links });
});

/**
 * @typedef EditLinkInfo /api/panel/admin/link/edit{One,Multi} request interface
 * @prop {number} linkId
 * @prop {boolean} shouldRevalidate
 * @prop {boolean} shouldInvalidate
 * @prop {number} [validAfterTimeStamp]
 * @prop {number} [validUntilTimeStamp]
 */
app.post("/api/panel/admin/link/editOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { linkId, shouldRevalidate, shouldInvalidate, validAfterTimeStamp, validUntilTimeStamp } =
    /** @type {EditLinkInfo} */ (req.body);
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
      res.json({ success: false, message: "You need to provide at least one timestamp" });
      return;
    }
    if (validAfterTimeStamp && validUntilTimeStamp && validAfterTimeStamp > validUntilTimeStamp) {
      res.json({ success: false, message: "validAfterTimeStamp is greater than validUntilTimeStamp" });
      return;
    }
    const options = {};
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
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const editInfos = /** @type {EditLinkInfo[]} */ (req.body);
  const editPromises = [];
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
      const options = {};
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

/**
 * @typedef AssignLinkToStudentInfo /api/panel/admin/link/assignToStudent{One,Multi} request interface
 * @prop {number} linkId
 * @prop {number} studentId
 */
app.post("/api/panel/admin/link/assignToStudentOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { linkId, studentId } = /** @type {AssignLinkToStudentInfo} */ (req.body);
  if (typeof linkId !== "number" || !Number.isSafeInteger(linkId) || typeof studentId !== "number") {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  await sql.assignLinkToStudent(linkId, studentId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/link/assignToStudentMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const linkAssignInfos = /** @type {AssignLinkToStudentInfo[]} */ (req.body);
  logger.info("assigning links to students", linkAssignInfos);
  const assignPromises = [];
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

/**
 * @typedef DeleteLinkInfo /api/panel/admin/link/delete{One,Multi} request interface
 * @prop {number} linkId
 */
app.post("/api/panel/admin/link/deleteOne", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { linkId } = /** @type {DeleteLinkInfo} */ (req.body);
  if (typeof linkId !== "number" || !Number.isSafeInteger(linkId)) {
    res.json({ success: false, message: "Missing necessary fields" });
    return;
  }
  await sql.removeAccessLink(linkId);
  res.json({ success: true, message: "" });
});

app.post("/api/panel/admin/link/deleteMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const deleteInfos = /** @type {DeleteLinkInfo[]} */ (req.body);
  logger.info(
    "deleting multiple links:",
    deleteInfos.map(({ linkId }) => linkId)
  );
  const deletePromises = [];
  for (const { linkId } of deleteInfos) {
    if (typeof linkId !== "number" || !Number.isSafeInteger(linkId)) {
      continue;
    }
    deletePromises.push(sql.removeAccessLink(linkId));
  }
  await Promise.all(deletePromises);
  res.json({ success: true, message: "" });
});

/**
 * @typedef RClientResponseData
 * @prop {AsyncReturnType<typeof sql.getRemoteClientById>} rclient
 * @prop {AsyncReturnType<typeof sql.getLinkById>} link
 * @prop {AsyncReturnType<typeof sql.getStudentById>} student
 * @prop {AsyncReturnType<typeof sql.getCameraById>} camera
 *
 * @typedef RClientResponse /api/panel/admin/rclient/:id response interface
 * @prop {boolean} success
 * @prop {string} message
 * @prop {RClientResponseData} [data]
 */
app.get("/api/panel/admin/rclient/:id", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
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
  /**
   * @type {RClientResponseData}
   */
  const rclientWithAdditionalData = { rclient, link, student, camera };
  res.json({
    success: true,
    message: "",
    data: rclientWithAdditionalData,
  });
});

app.get("/api/panel/admin/rclients", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const rclients = await sql.getAllRemoteClients();
  /**
   * @type {RClientResponseData[]}
   */
  const rclientsWithAdditionalData = await Promise.all(
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
    data: rclientsWithAdditionalData,
  });
});

/**
 * @typedef {AsyncReturnType<typeof sql.getCameraById>} CameraResponseData
 */
app.get("/api/panel/admin/cameras", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  /**
   * @type {CameraResponseData[]}
   */
  const cameras = await sql.getAllCameras();
  res.json({
    success: true,
    message: "",
    data: cameras,
  });
});

app.get("/api/panel/admin/camera/:id", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const { id } = req.params;
  logger.info("getCamera request received from client for camera", id);
  /**
   * @type {CameraResponseData}
   */
  const camera = await sql.getCameraById(id);
  if (!camera) {
    res.json({ success: false, message: "No such camera" });
    return;
  }
  res.json({
    success: true,
    message: "",
    data: camera,
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

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
