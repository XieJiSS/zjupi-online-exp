/** @format */

"use strict";

import assert from "assert";
import { hasAuthed } from "../db/connect";
assert(hasAuthed);

import getLogger from "../util/logger";
import dbLogApi from "../db/api/db-log-api";
const logger = getLogger("cam-req-proxy");
logger.error = dbLogApi.getPersistentLoggerUtil("error", __filename, logger.error.bind(logger));
logger.warn = dbLogApi.getPersistentLoggerUtil("warn", __filename, logger.warn.bind(logger));

import { default as _axios } from "axios";
import type { AxiosResp } from "../types/type-helper";

const axios = _axios.create({
  timeout: 3000,
});

export type CameraDirection = "left" | "right" | "up" | "down";
export type CameraOperation = "start" | "stop";
export type CameraClientOperationReqBody =
  | {
      direction: CameraDirection;
      operation: "start";
      speed: number;
    }
  | {
      direction: void;
      operation: "stop";
      speed: number;
    };

export async function pingCameraIP(cameraIP: string) {
  try {
    await axios.get<AxiosResp<void>>(`http://${cameraIP}/api/camera-client/ping`);
  } catch {
    return false;
  }
  return true;
}

/**
 * @throws {TypeError} if direction is not string or void when operation is "start" or "stop", respectively
 */
export async function sendOpToCameraIP<T extends CameraOperation>(
  cameraIP: string,
  direction: T extends "start" ? CameraDirection : T extends "stop" ? void : never,
  operation: T,
  speed?: number
) {
  if (operation === "stop") speed = 0;
  if (typeof speed !== "number") speed = 40;

  let body: CameraClientOperationReqBody;

  if (operation === "start") {
    if (typeof direction !== "string") throw new TypeError("direction must be undefined");
    body = {
      direction,
      operation: "start",
      speed,
    };
  } else {
    if (typeof direction !== "undefined") throw new TypeError("direction must be undefined");
    body = {
      direction,
      operation: "stop",
      speed,
    };
  }

  let resp;

  try {
    resp = await axios.post<AxiosResp<void>>(`http://${cameraIP}:5004/api/camera-client/operation`, body);
  } catch {
    logger.error(`Failed to send operation ${direction} ${operation} ${speed} to camera ${cameraIP}`);
    return false;
  }

  if (!resp.data.success) {
    logger.error(
      `Failed to send operation ${direction} ${operation} ${speed} to camera ${cameraIP} due to`,
      resp.data.message
    );
    return false;
  }
  return true;
}
