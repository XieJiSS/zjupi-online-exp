require("dotenv").config({ path: __dirname + "/../.env" });

const assert = require("assert");
assert(process.env["DOMAIN"] && process.env["DOMAIN"].length > 0, "config DOMAIN is required.");

const path = require("path");
const { writeFileSync } = require("fs");
const logger = require("../util/logger")("conf-generator");

const template = `
upstream %name% {
  server 127.0.0.1:%port%;
  keepalive 64;
}

server {
  listen 127.0.0.1:80;
  server_name %subdomain%.%domain%;
  location / {
    proxy_pass http://%name%;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
`.trimStart();

let conf = `
server {
  listen 80 default_server;
  server_name _;
  return 301 https://$host$request_uri;
}
`.trimStart();

if (process.env["MODE"] === "dev") {
  conf = "";
}

const servers = require("../servers/configs");
for (const server of servers) {
  logger.info(`Generating config for server ${server.name} ...`);
  assert(/^[a-zA-Z0-9_]+$/.test(server.name), "server name must be alphanumeric.");
  conf += "\n";
  conf += template
    .replace(/%name%/g, server.name)
    .replace(/%port%/g, server.port)
    .replace(/%subdomain%/g, server.subdomain)
    .replace(/%domain%/g, process.env["DOMAIN"]);
}

writeFileSync(__dirname + "/../multi-server.conf", conf);
logger.info("Generated config file written to", path.resolve(__dirname + "/../multi-server.conf"));
