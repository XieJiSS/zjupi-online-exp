// @ts-check

const assert = require("assert");

const { getSequelizeInst, hasAuthed } = require("../connect");
assert(hasAuthed);

const Sequelize = require("sequelize");
const sequelize = getSequelizeInst();

const _RemoteClient = sequelize.define(
  "remote_client",
  {
    clientId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordExpireAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastActive: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    online: {
      type: Sequelize.VIRTUAL,
      get() {
        /**
         * @type {number | null}
         */
        // @ts-ignore
        const lastActive = this.lastActive;
        return lastActive === null ? false : Date.now() - lastActive < 1000 * 60;
      },
      set(_) {
        throw new Error("Do not try to set the online attribute of the RemoteClient Model!");
      },
    },
  },
  {
    timestamps: false,
  }
);

const { unionTypeValue } = require("../../util/type-helper");

const ModelTypeInterface = {
  clientId: "clientId",
  password: "password",
  passwordExpireAt: 0,
  ip: "ip",
  lastActive: unionTypeValue(0, null),
  online: true,
};

/**
 * @type {import("sequelize").ModelCtor<import("sequelize").Model<any, any> & typeof ModelTypeInterface>}
 */
// @ts-ignore
const RemoteClient = _RemoteClient;

module.exports = RemoteClient;
