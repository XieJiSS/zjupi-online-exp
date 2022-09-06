// @ts-check

/**
 * @type {{ app: import("express").Express, port: number, name: string, subdomain: string }[]}
 */
const servers = require("./lists").map((mod) => require(mod));

module.exports = servers;
