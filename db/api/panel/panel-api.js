// @ts-check

const AccessLinkAPI = require("./access-link-api");
const PanelAdminAPI = require("./panel-admin-api");
const PanelStudentAPI = require("./panel-student-api");

module.exports = {
  ...AccessLinkAPI,
  ...PanelAdminAPI,
  ...PanelStudentAPI,
};
