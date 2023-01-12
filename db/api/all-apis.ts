/** @format */

import CameraAPI from "./camera/camera-api";
import DBLogAPI from "./db-log-api";
import PanelAPI from "./panel/panel-api";
import RemoteControlAPI from "./remote-control/remote-control-api";
import * as DevicesAPI from "./devices-api";

export default {
  ...CameraAPI,
  ...DBLogAPI,
  ...PanelAPI,
  ...RemoteControlAPI,
  ...DevicesAPI,
};
