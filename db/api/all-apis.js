// @ts-check

const CameraAPI = require("./camera/camera-api");
const PanelAPI = require("./panel/panel-api");
const RemoteControlAPI = require("./remote-control/remote-control-api");

module.exports = {
  ...CameraAPI,
  ...PanelAPI,
  ...RemoteControlAPI,
};
