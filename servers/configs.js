// @ts-check

/**
 * @type {{ port: number, name: string, subdomain: string }[]}
 */
const configs = require("./lists").map((mod) => require(mod + "/config"));

module.exports = configs;
