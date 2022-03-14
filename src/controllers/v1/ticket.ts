import { inject } from 'inversify';
import {
  httpGet,
  httpPut,
  httpPost,
  BaseHttpController,
  interfaces,
  controller,
} from 'inversify-express-utils';
import { Response } from 'express';

import TYPES from '../../utilities/types';
import { controllerPaginationHelper } from '../../utilities/utils';
import ProfileType from '../../enumerators/profile-type';

import authenticate from '../middlewares/authenticate'
import authorize from '../middlewares/authorization';

import TicketEntity from '../../db/entities/ticket';
import { ITicketService } from '../../services/interfaces/ticket';

import { ICustomRequest } from '../../models/custom-request';
import { AdditionalInformation } from '../../models/user';
import { Pagination, ISearchParameterTicket } from '../../models/pagination';

import {
  ticketCreateRouteValidation,
  ticketGetByIdRouteValidation,
  ticketGetWithPaginationRouteValidation,
  ticketUpdateByIdRouteValidation,
} from '../validation/ticket';
import { validationRoute } from '../../utilities/errors/validation';

@controller('/ticket', authenticate)
export class TicketController extends BaseHttpController implements interfaces.Controller {

  constructor(
    @inject(TYPES.TicketService)
    private ticketService: ITicketService,
  ) {
    super();
  }

  @httpPost('/',
    authorize([ProfileType.PARTICIPANT]),
    ...ticketCreateRouteValidation
  )
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.ticketService.create(
      parseInt(req.body.quantity),
      req.body.event,
      additionalInformation
    );
  }

  @httpGet('/',
    ...ticketGetWithPaginationRouteValidation
  )
  private async getWithPagination(req: ICustomRequest, res: Response): Promise<Pagination<TicketEntity> | any> {
    const searchParameter: ISearchParameterTicket = {
      ...req.query && req.query.participant && {
        participant: req.query.participant.toString(),
      },
      ...req.query && req.query.promoter && {
        promoter: req.query.promoter.toString(),
      },
      ...req.query && req.query.event && {
        event: req.query.event.toString(),
      },
      ...req.query && req.query.status && {
        status: req.query.status.toString(),
      },
      ...controllerPaginationHelper(req),
    };
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.ticketService.getWithPagination(searchParameter, additionalInformation);
  }

  @httpGet(
    '/:id',
    ...ticketGetByIdRouteValidation
  )
  private async getById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    const additionalInformation = {
      actor: req.user
    }
    return await this.ticketService.getById(req.params.id, additionalInformation);
  }

  @httpPut('/:id',
    ...ticketUpdateByIdRouteValidation
  )
  private async updateById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    if (Object.keys(req.body).length === 0) {
      return res.sendStatus(204);
    }
    const ticket = req.params.id;
    const status = parseInt(req.body.status);
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.ticketService.updateById(ticket, status, additionalInformation);
  }
}
