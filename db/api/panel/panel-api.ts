/** @format */

import AccessLinkAPI from "./access-link-api";
import PanelAdminAPI from "./panel-admin-api";
import PanelStudentAPI from "./panel-student-api";

export default {
  ...AccessLinkAPI,
  ...PanelAdminAPI,
  ...PanelStudentAPI,
};
