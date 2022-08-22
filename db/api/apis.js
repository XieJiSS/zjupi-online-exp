// @ts-check

const CameraAPI = require("./camera");
const PanelAPI = require("./panel");
const RemoteControlAPI = require("./remote-control");

module.exports = {
  ...CameraAPI,
  ...PanelAPI,
  ...RemoteControlAPI,
};
