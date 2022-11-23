import assert from "assert";
import { hasAuthed } from "db/connect";
assert(hasAuthed());

import type { TExtractModelKeyUnion, TModelAttrsOnly, TModelListAttrsOnly } from "types/type-helper";

import getLogger from "util/logger";
import { getPersistentLoggerUtil } from "db/api/db-log-api";
const logger = getLogger("panel-student-api");
logger.error = getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import { Student, RemoteClient, Camera } from "db/models/all-models";
import { StudentModelCtor } from "db/models/all-models";
import accessLinkApi from "./access-link-api";

async function getLinkByStudentId(studentId: number) {
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    return null;
  }
  const linkId = student.linkId;
  if (!linkId) {
    return null;
  }
  return await accessLinkApi.getLinkById(linkId);
}

async function getLinkByStudentPhone(phone: string) {
  const student = await Student.findOne({ where: { phone } });
  if (!student) {
    return null;
  }
  const linkId = student.linkId;
  if (!linkId) {
    return null;
  }
  return await accessLinkApi.getLinkById(linkId);
}

async function createStudent(name: string, phone: string) {
  const student = await getStudentByNameAndPhone(name, phone);
  if (student !== null) {
    logger.error("createStudent: student", name, phone, "already exists");
    return null;
  }
  return await Student.create({ name, phone });
}

async function getStudentByLinkId(linkId: number) {
  const link = await accessLinkApi.getLinkById(linkId);
  if (!link) {
    return null;
  }
  return await Student.findOne({ where: { linkId } });
}

async function getStudentByLinkIdAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(
  linkId: number,
  attributes: Readonly<T[]>
): Promise<TModelAttrsOnly<StudentModelCtor, T>> {
  const link = await accessLinkApi.getLinkById(linkId);
  if (!link) {
    return null;
  }
  return (await Student.findOne({
    where: { linkId },
    attributes: attributes as T[],
  })) as TModelAttrsOnly<StudentModelCtor, T>;
}

async function setStudentLinkId(studentId: number, linkId: number) {
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

async function getAllStudentsAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(
  attributes: Readonly<T[]>
): Promise<TModelListAttrsOnly<StudentModelCtor, T>> {
  return (await Student.findAll({
    attributes: attributes as T[],
  })) as TModelListAttrsOnly<StudentModelCtor, T>;
}

async function getStudentById(studentId: number) {
  return await Student.findOne({ where: { studentId } });
}

async function getStudentByIdAttrsOnly<T extends TExtractModelKeyUnion<StudentModelCtor>>(
  studentId: number,
  attributes: Readonly<T[]>
): Promise<TModelAttrsOnly<StudentModelCtor, T>> {
  return (await Student.findOne({
    where: { studentId },
    attributes: attributes as T[],
  })) as TModelAttrsOnly<StudentModelCtor, T>;
}

async function getStudentByNameAndPhone(name: string, phone: string) {
  return await Student.findOne({ where: { name, phone } });
}

async function getCameraByStudentId(studentId: number) {
  const link = await getLinkByStudentId(studentId);
  if (!link || !link.cameraId) {
    return null;
  }
  return await Camera.findOne({ where: { cameraId: link.cameraId } });
}

async function getCameraByStudentPhone(phone: string) {
  const link = await getLinkByStudentPhone(phone);
  if (!link || !link.cameraId) {
    return null;
  }
  return await Camera.findOne({ where: { cameraId: link.cameraId } });
}

async function getRemoteClientByStudentId(studentId: number) {
  const link = await getLinkByStudentId(studentId);
  if (!link) {
    return null;
  }
  return await RemoteClient.findOne({ where: { clientId: link.clientId } });
}

async function getRemoteClientByStudentPhone(phone: string) {
  const link = await getLinkByStudentPhone(phone);
  if (!link) {
    return null;
  }
  return await RemoteClient.findOne({ where: { clientId: link.clientId } });
}

async function removeStudentById(studentId: number) {
  const student = await Student.findOne({ where: { studentId } });
  if (!student) {
    logger.warn(`removeStudentById: student ${studentId} not found`);
    return;
  }
  await student.destroy();
}

export default {
  createStudent,
  getLinkByStudentId,
  getLinkByStudentPhone,
  getAllStudents,
  getAllStudentsAttrsOnly,
  getStudentById,
  getStudentByIdAttrsOnly,
  getStudentByLinkId,
  getStudentByLinkIdAttrsOnly,
  getCameraByStudentId,
  getCameraByStudentPhone,
  getRemoteClientByStudentId,
  getRemoteClientByStudentPhone,
  setStudentLinkId,
  removeStudentById,
};
