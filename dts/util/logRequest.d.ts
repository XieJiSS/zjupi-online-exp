import type { Logger } from "log4js";
import type { RequestHandler } from "express";
export default function initLogRequest(serverName: string, logger: Logger): RequestHandler;
