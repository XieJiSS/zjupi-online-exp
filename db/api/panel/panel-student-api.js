// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Student, RemoteClient, Camera } = require("../../models");

const logger = require("../../../util/logger")("panel-student-api");
const { hookLogUtil } = require("../admin-log");
logger.error = hookLogUtil("error", __filename, logger.error.bind(logger));
logger.warn = hookLogUtil("warn", __filename, logger.warn.bind(logger));

const accessLinkApi = require("./access-link-api");

/**
 * @param {number} studentId
 */
async function getLinkObjByStudentId(studentId) {
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    return null;
  }
  const linkId = student.linkId;
  if (!linkId) {
    return null;
  }
  return await accessLinkApi.getLinkObjById(linkId);
}

/**
 * @param {string} phone
 */
async function getLinkObjByStudentPhone(phone) {
  const student = await Student.findOne({ where: { phone } });
  if (!student) {
    return null;
  }
  const linkId = student.linkId;
  if (!linkId) {
    return null;
  }
  return await accessLinkApi.getLinkObjById(linkId);
}

/**
 * @param {string} name
 * @param {string} phone
 */
async function createStudent(name, phone) {
  const student = await getStudentByNameAndPhone(name, phone);
  if (student !== null) {
    logger.error("createStudent: student", name, phone, "already exists");
    return null;
  }
  return await Student.create({ name, phone });
}

/**
 * @param {number} linkId
 */
async function getStudentByLinkId(linkId) {
  const link = await accessLinkApi.getLinkObjById(linkId);
  if (!link) {
    return null;
  }
  return await Student.findOne({ where: { linkId } });
}

async function setStudentLinkId(studentId, linkId) {
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    logger.warn(`setStudentLinkId: student ${studentId} not found`);
    return null;
  }
  return await student.update({ linkId });
}

async function getAllStudents() {
  return await Student.findAll();
}

/**
 * @param {Array<keyof import("../../models/Student").TModelAttributes>} attributes
 */
async function getAllStudentsWithSpecificAttributes(attributes) {
  return await Student.findAll({ attributes });
}

/**
 * @param {number} studentId
 */
async function getStudentById(studentId) {
  return await Student.findOne({ where: { studentId } });
}

/**
 * @param {string} name
 * @param {string} phone
 */
async function getStudentByNameAndPhone(name, phone) {
  return await Student.findOne({ where: { name, phone } });
}

/**
 * @param {number} studentId
 */
async function getCameraByStudentId(studentId) {
  const link = await getLinkObjByStudentId(studentId);
  if (!link || !link.cameraId) {
    return null;
  }
  return await Camera.findOne({ where: { cameraId: link.cameraId } });
}

/**
 * @param {string} phone
 */
async function getCameraByStudentPhone(phone) {
  const link = await getLinkObjByStudentPhone(phone);
  if (!link || !link.cameraId) {
    return null;
  }
  return await Camera.findOne({ where: { cameraId: link.cameraId } });
}

/**
 * @param {number} studentId
 */
async function getRemoteClientByStudentId(studentId) {
  const link = await getLinkObjByStudentId(studentId);
  if (!link) {
    return null;
  }
  return await RemoteClient.findOne({ where: { clientId: link.clientId } });
}

/**
 * @param {string} phone
 */
async function getRemoteClientByStudentPhone(phone) {
  const link = await getLinkObjByStudentPhone(phone);
  if (!link) {
    return null;
  }
  return await RemoteClient.findOne({ where: { clientId: link.clientId } });
}

/**
 * @param {number} studentId
 */
async function removeStudentById(studentId) {
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    logger.warn(`removeStudentById: student ${studentId} not found`);
    return null;
  }
  return await student.destroy();
}

module.exports = {
  createStudent,
  getLinkObjByStudentId,
  getLinkObjByStudentPhone,
  getAllStudents,
  getAllStudentsWithSpecificAttributes,
  getStudentById,
  getStudentByLinkId,
  getCameraByStudentId,
  getCameraByStudentPhone,
  getRemoteClientByStudentId,
  getRemoteClientByStudentPhone,
  setStudentLinkId,
  removeStudentById,
};
