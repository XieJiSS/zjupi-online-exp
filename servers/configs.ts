/** @format */

import serverLists from "./lists";

export interface Config {
  port: number;
  name: string;
  subdomain: string;
}

export const configs: Config[] = serverLists.map((mod) => require(mod + "/config"));
