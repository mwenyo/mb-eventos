import dotenv from 'dotenv';
dotenv.config({
  path: __dirname + '/../.env.development',
});
export class Constants {
  env: 'production' | 'development';
  debug: boolean;
  port: number;
  appName: string;

  timezone: string;
  language: string;

  auth: {
    accessTokenSecret: string,
    refreshTokenSecret: string,
    accessTokenExpiration: string,
    refreshTokenExpiration: string
  }

  database: {
    hostWrite: string,
    name: string,
    user: string,
    password: string,
    port: number,
  };

  constructor(props: any) {
    this.env = props.NODE_ENV;
    this.appName = process.env.APP_NAME;
    this.port = parseInt(process.env.API_PORT, 10);

    this.debug = process.env.DEBUG === 'true';

    this.timezone = process.env.TIMEZONE;
    this.language = process.env.LANGUAGE;

    this.auth = {
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
      accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
      refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION
    }

    this.database = {
      hostWrite: process.env.DATABASE_HOST,
      name: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT || '10', 10),
    };
  }
}

export let ConstantsEnv: Constants;

export const initializeEnv: any = (props: any): void => {
  ConstantsEnv = new Constants(props);
};

export const getEnv = (): Constants => ConstantsEnv;