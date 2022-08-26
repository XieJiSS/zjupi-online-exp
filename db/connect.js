// @ts-check

const { Sequelize } = require("sequelize");
const logger = require("../util/logger")("db");

const poolSize = Math.max(require("os").cpus().length - 1, 1);
logger.debug("Will set poolSize to", poolSize);

/**
 * @type {Sequelize?}
 */
let _sequelize = null;
const seqLogger = require("../util/logger")("sequelize");

require("async-exit-hook")((done) => {
  logger.info("Gracefully shutting down database connection...");
  if (_sequelize !== null) {
    logger.debug("Waiting for database connection to be closed...");
    _sequelize.close().then(() => {
      logger.debug("Database connection closed.");
      done();
    });
  } else {
    done();
  }
});

module.exports =
  /** @type {{ _promise: Promise<Sequelize>, hasAuthed: () => boolean, getGlobalSequelizeInstance: () => Sequelize }} */ ({
    _promise: new Promise((resolve, reject) => {
      const sequelize = new Sequelize("db", "root", process.env["DB_MYSQL_PSWD"], {
        host: "localhost",
        dialect: "mysql",
        port: 3306,
        pool: {
          max: poolSize,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: (sql) => seqLogger.debug.bind(seqLogger)(sql),
      });
      sequelize
        .authenticate()
        .then(() => {
          logger.info("Successfully authenticated.");
          _sequelize = sequelize;
          resolve(sequelize);
        })
        .catch(reject);
    }),
    hasAuthed() {
      return _sequelize !== null;
    },
    getGlobalSequelizeInstance() {
      return _sequelize;
    },
  });
