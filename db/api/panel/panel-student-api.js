// @ts-check

const assert = require("assert");
const { hasAuthed } = require("../../connect");
assert(hasAuthed());

const { Student, RemoteClient } = require("../../models");

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
 * @param {number} studentId
 */
async function getCameraByStudentId(studentId) {
  const link = await getLinkObjByStudentId(studentId);
  if (!link) {
    return null;
  }
  // @TODO: implement CameraModel and camera-api
}

/**
 * @param {string} phone
 */
async function getCameraByStudentPhone(phone) {
  const link = await getLinkObjByStudentPhone(phone);
  if (!link) {
    return null;
  }
  // @TODO: implement CameraModel and camera-api
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
  getCameraByStudentId,
  getCameraByStudentPhone,
  getRemoteClientByStudentId,
  getRemoteClientByStudentPhone,
};
