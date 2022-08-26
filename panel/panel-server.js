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

const sql = require("../db/api");

const CLASS_DURATION = (Number(process.env["CLASS_DURATION_MINUTES"]) || 240) * 60 * 1000;

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

/**
 * @typedef AdminSession
 * @prop {string | null} username
 */
app.post("/api/panel/admin/login", async (req, res) => {
  const { username, password } = req.body;
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
  await promisify(session.save)();
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
  await promisify(session.save)();
  res.json({ success: true, message: "" });
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

app.get("/api/panel/admin/students/all", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const students = await sql.getAllStudentsWithSpecificAttributes(["studentId", "name", "phone"]);
  res.json({
    success: true,
    message: "",
    data: students,
  });
});

app.get("/api/panel/admin/students/:id", async (req, res) => {
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
 * @typedef AddStudentInfo /api/panel/admin/students/add{One,Multi} request interface
 * @prop {string} name
 * @prop {string} phone
 */
app.post("/api/panel/admin/students/addOne", async (req, res) => {
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

app.post("/api/panel/admin/students/addMulti", async (req, res) => {
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
 * @typedef DeleteStudentInfo /api/panel/admin/students/delete{One,Multi} request interface
 * @prop {number} studentId
 */
app.post("/api/panel/admin/students/deleteOne", async (req, res) => {
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

app.post("/api/panel/admin/students/deleteMulti", async (req, res) => {
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

app.get("/api/panel/admin/links/all", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const remoteClients = await sql.getAllRemoteClientsWithLinks();
  const links = await Promise.all(
    remoteClients
      .map(({ link }) => link)
      .map(async ({ linkId, linkPath, isValid, validUntil, cameraId, clientId }) => ({
        linkId,
        linkPath,
        isValid,
        validUntil,
        cameraId,
        clientId,
        student: await sql.getStudentByLinkIdWithSpecificAttributes(linkId, ["studentId", "name", "phone"]),
      }))
  );
  res.json({
    success: true,
    message: "",
    data: links,
  });
});

app.get("/api/panel/admin/links/:id", async (req, res) => {
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
  const link = await sql.getLinkById(linkId);
  if (!link) {
    res.json({ success: false, message: "Link not found" });
    return;
  }
  const student = await sql.getStudentByLinkIdWithSpecificAttributes(linkId, ["studentId", "name", "phone"]);
  res.json({
    success: true,
    message: "",
    data: {
      ...link,
      student,
    },
  });
});

/**
 * @typedef AddLinkInfo /api/panel/admin/links/add{One,Multi} request Interface
 * @prop {string} clientId
 * @prop {number} validAfterTimeStamp
 * @prop {number} validUntilTimeStamp
 */
app.post("/api/panel/admin/links/addOne", async (req, res) => {
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

app.post("/api/panel/admin/links/addMulti", async (req, res) => {
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
 * @typedef EditLinkInfo /api/panel/admin/links/edit{One,Multi} request interface
 * @prop {number} linkId
 * @prop {boolean} shouldRevalidate
 * @prop {boolean} shouldInvalidate
 * @prop {number} [validAfterTimeStamp]
 * @prop {number} [validUntilTimeStamp]
 */
app.post("/api/panel/admin/links/editOne", async (req, res) => {
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

app.post("/api/panel/admin/links/editMulti", async (req, res) => {
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
 * @typedef AssignLinkToStudentInfo /api/panel/admin/links/assignToStudent{One,Multi} request interface
 * @prop {number} linkId
 * @prop {string} studentId
 */
app.post("/api/panel/admin/links/assignToStudentOne", async (req, res) => {
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

app.post("/api/panel/admin/links/assignToStudentMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const linkAssignInfos = /** @type {AssignLinkToStudentInfo[]} */ (req.body);
  const assignPromises = [];
  for (const { linkId, studentId } of linkAssignInfos) {
    if (typeof linkId !== "number" || !Number.isSafeInteger(linkId) || typeof studentId !== "number") {
      continue;
    }
    assignPromises.push(sql.assignLinkToStudent(linkId, studentId));
  }
  await Promise.all(assignPromises);
  res.json({ success: true, message: "" });
});

/**
 * @typedef DeleteLinkInfo /api/panel/admin/links/delete{One,Multi} request interface
 * @prop {number} linkId
 */
app.post("/api/panel/admin/links/deleteOne", async (req, res) => {
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

app.post("/api/panel/admin/links/deleteMulti", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const deleteInfos = /** @type {DeleteLinkInfo[]} */ (req.body);
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

app.get("/api/panel/admin/rclients/:id", async (req, res) => {
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
  const camera = link && link.cameraId ? await sql.getCameraByCameraId(link.cameraId) : null;
  res.json({
    success: true,
    message: "",
    data: {
      remoteClient: rclient,
      link,
      student,
      camera,
    },
  });
});

app.get("/api/panel/admin/rclients/all", async (req, res) => {
  const session = /** @type {AdminSession & Express.Request["session"]} */ (req.session);
  if (!session.username) {
    res.json({ success: false, message: "Authentication required" });
    return;
  }
  const rclients = await sql.getAllRemoteClientsWithLinks();
  const rclientsWithStudentsAndCameras = await Promise.all(
    rclients.map(async (rclient) => {
      const link = rclient.link;
      const student = link ? await sql.getStudentByLinkId(link.linkId) : null;
      const camera = link && link.cameraId ? await sql.getCameraByCameraId(link.cameraId) : null;
      return {
        ...rclient,
        student,
        camera,
      };
    })
  );
  res.json({
    success: true,
    message: "",
    data: rclientsWithStudentsAndCameras,
  });
});

app.use(express.static(path.join(__dirname, "panel-frontend", "dist")));

module.exports = {
  app,
  port,
  name: serverName,
  subdomain,
};
