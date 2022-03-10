import { initializeEnv, getEnv } from './constants';
import { initializeDatabase } from './db/database';
import { Settings } from 'luxon';
import 'dotenv'

export async function initializeShared(): Promise<void> {
  Settings.defaultLocale = getEnv().language;
  Settings.defaultZone = getEnv().timezone;
}

const loadSecretEnv: any = async (): Promise<void> => {
  if (!process.env.NODE_ENV) { throw new Error('missing_env:NODE_ENV'); }

  initializeEnv({ NODE_ENV: process.env.NODE_ENV });
};

(async (): Promise<void> => {
  await loadSecretEnv();
  await initializeDatabase();
  await initializeShared();

  const { Server } = require('./server');

  new Server();
})().catch((err: any): void => console.error(err));
