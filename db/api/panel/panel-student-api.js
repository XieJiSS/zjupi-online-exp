// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Student, RemoteClient, Camera } = require("../../models");

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
 * @param {number} linkId
 */
async function getStudentByLinkId(linkId) {
  const link = await accessLinkApi.getLinkObjById(linkId);
  if (!link) {
    return null;
  }
  return await Student.findOne({ where: { linkId } });
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

module.exports = {
  getLinkObjByStudentId,
  getLinkObjByStudentPhone,
  getStudentByLinkId,
  getCameraByStudentId,
  getCameraByStudentPhone,
  getRemoteClientByStudentId,
  getRemoteClientByStudentPhone,
};
