// @ts-check

import type { Express } from "express";
import serverLists from "./lists";

export interface Server {
  app: Express;
  port: number;
  name: string;
  subdomain: string;
}

// make this lazy loaded
export function getServers(): Server[] {
  return serverLists.map((mod) => require(mod));
}
