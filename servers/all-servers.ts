/** @format */

import type { Express } from "express";
import serverLists from "./lists";

export interface Server {
  app: Express;
  port: number;
  name: string;
  subdomain: string;
}

// make this lazy loaded
export function getServers(): Promise<Server[]> {
  return Promise.all(serverLists.map(async (mod): Promise<Server> => await import(mod)));
}
