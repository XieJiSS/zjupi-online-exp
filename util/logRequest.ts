/** @format */

import type { Logger } from "log4js";
import type { RequestHandler } from "express";

export default function initLogRequest(serverName: string, logger: Logger): RequestHandler {
  const logRequest: RequestHandler = function (req, res, next) {
    const hash = (~~(Math.random() * 2147483648)).toString(16).padStart(8, "0");
    logger.info(`IN   ${hash} ${serverName}: ${req.method} ${req.url} ${req.headers["x-real-ip"]}`);

    const startTime = Date.now();

    // hook res.json for logging
    const json = res.json;

    const resDotJSON: typeof json = function (body) {
      let jsonBody = JSON.stringify(body);
      if (jsonBody.length > 400) {
        jsonBody = jsonBody.substring(0, 300) + "...";
      }
      logger.info(`HOOK ${hash}: preparing json response`, jsonBody);
      // restore res.json so that it can be called again, with the correct `this`
      res.json = json;
      return res.json(body);
    };
    res.json = resDotJSON;

    res.once("finish", () => {
      const duration = Date.now() - startTime;
      if (res.statusCode >= 300 && res.statusCode < 400) {
        logger.info(`OUT  ${hash}:`, `status=${res.statusCode} in ${duration}ms`);
      } else {
        logger.info(
          `OUT  ${hash}:`,
          `status=${res.statusCode} in ${duration}ms`,
          `mime=${res.getHeader("content-type")}`,
          `len=${res.getHeader("content-length")}`
        );
      }
    });

    // pass the control to the next middleware
    next();
  };

  return logRequest;
}
