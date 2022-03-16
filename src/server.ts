import { Container } from 'inversify';
import * as httpStatus from 'http-status';
import cors from 'cors';
import compress from 'compression';
import helmet from 'helmet';
import { v4 } from 'uuid';
import cookieParser from 'cookie-parser';
import { InversifyExpressServer } from 'inversify-express-utils';
import express, { NextFunction, Request, Response } from 'express';

import './controllers';

import TYPES from './utilities/types';
import { ConstantsEnv } from './constants';

import { IUserService } from './services/interfaces/user';
import { IEventService } from './services/interfaces/event';
import { IUserCredentialService } from './services/interfaces/user-credential';
import { UserService } from './services/user';
import { UserRepository } from './db/repositories/user';
import { IUserRepository } from './db/repositories/interfaces/user';

import { IEventRepository } from './db/repositories/interfaces/event';
import { UserCredentialService } from './services/user-credential';

import { EventService } from './services/event';
import { EventRepository } from './db/repositories/event';
import { ITicketService } from './services/interfaces/ticket';
import { ITicketRepository } from './db/repositories/interfaces/ticket';
import { TicketService } from './services/ticket';
import { TicketRepository } from './db/repositories/ticket';

const container: Container = new Container();

const handleError: any = (err: any, req: Request, res: Response): void => {
  if (err.isBusinessError) {
    res.status(httpStatus.BAD_REQUEST).json({
      error: err.code,
      options: err.options,
    });

  } else if (err.isUnauthorizedError) {
    res.sendStatus(httpStatus.UNAUTHORIZED);
  } else if (err.isForbiddenError) {
    res.sendStatus(httpStatus.FORBIDDEN);
  } else {
    console.log('Error: ', {
      err,
      type: 'error',
      req: {
        requestId: req.headers['X-Request-ID'],
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        method: req.method,
        urlPath: req.path,
        urlQuery: req.query,
      },
    });

    if (ConstantsEnv.env !== 'production') {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        stack: err.stack, message: err.message, ...err,
      });
    } else {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
};

export class Server {

  constructor() {
    this.configDependencies();
    this.createServer();
  }

  configDependencies(): void {
    container
      .bind<IUserService>(TYPES.UserService).to(UserService);
    container
      .bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

    container
      .bind<IEventService>(TYPES.EventService).to(EventService);
    container
      .bind<IEventRepository>(TYPES.EventRepository).to(EventRepository);

    container
      .bind<ITicketService>(TYPES.TicketService).to(TicketService);
    container
      .bind<ITicketRepository>(TYPES.TicketRepository).to(TicketRepository);

    container
      .bind<IUserCredentialService>(TYPES.UserCredentialService)
      .to(UserCredentialService);
  }

  createServer(): void {
    const server: InversifyExpressServer = new InversifyExpressServer(container, null, { rootPath: '/api' });

    server.setConfig((app: any): any => {
      // add body parser
      app.use(express.urlencoded({
        extended: true,
        limit: '10mb',
      }));
      app.use(express.json({
        limit: '10mb',
      }));

      app.disable('etag');

      app.use(compress());

      app.use(helmet());

      app.use(cors());

      app.use(cookieParser())

      app.use((req: Request, _res: Response, next: NextFunction): void => {
        req.headers['X-Request-ID'] = v4();
        next();
      });
    });

    server.setErrorConfig((app: any): void => {
      app.use((_req: Request, res: Response): void => {
        res.status(httpStatus.NOT_FOUND).json();
      });

      app.use((
        err: any,
        req: Request,
        res: Response,
        next: NextFunction): void => handleError(err, req, res));
    });

    const app: any = server.build();

    app.listen(ConstantsEnv.port, (): void => console.log(`🔥 API MB Eventos Online - ${ConstantsEnv.port}\n`));
  }
}
