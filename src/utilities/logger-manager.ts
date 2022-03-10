import * as winston from 'winston';
import * as util from 'util';
import lawgs from 'lawgs';
import { ConstantsEnv } from '../constants';
if (ConstantsEnv && ConstantsEnv.debug) {
  // eslint-disable-next-line global-require
  const fs = require('fs');

  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
}

const getLogger = (fileName: string): object => winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: `${fileName}.log`,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      dirname: 'logs',
      options: {},
      rotationFormat: null,
      zippedArchive: false,
      eol: '\n',
      tailable: true,
    }),
  ],
  exitOnError: false,
});

const loggers: any = {};

const LoggerManager = {

  log: (action: string, data: any): void => {
    if (!ConstantsEnv.debug) {
      lawgs
        .getOrCreate(`${ConstantsEnv.appName}-${ConstantsEnv.env}`)
        .log(`${action}`, util.inspect(data, false, null));
    } else {
      if (!loggers[`${ConstantsEnv.env}-${action}`]) {
        loggers[`${ConstantsEnv.env}-${action}`] = getLogger(`${'local'}-${action}`);
      }

      loggers[`${ConstantsEnv.env}-${action}`].info({ action, data });
    }
  },

  databaseLogger: {
    logMigration: (o: any): void => LoggerManager.log('application-log', {
      type: 'database', data: o,
    }),
    logQuery: (o: any): void => {
      if (ConstantsEnv.debug) {
        LoggerManager.log('application-log', { type: 'database', data: o });
      }
    },
    logQueryError: (o: any): void => {
      if (ConstantsEnv.debug) {
        LoggerManager.log('application-log', { type: 'database', data: o });
      }
    },
    logQuerySlow: (o: any): void => {
      if (ConstantsEnv.debug) {
        LoggerManager.log('application-log', { type: 'database', data: o });
      }
    },
    logSchemaBuild: (o: any): void => {
      if (ConstantsEnv.debug) {
        LoggerManager.log('application-log', { type: 'database', data: o });
      }
    },
    log: (o: any): void => {
      if (ConstantsEnv.debug) {
        LoggerManager.log('application-log', { type: 'database', data: o });
      }
    },
  },

};

export default LoggerManager;
