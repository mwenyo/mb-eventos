import { inject } from 'inversify';
import {
  httpGet,
  httpPut,
  httpPost,
  BaseHttpController,
  interfaces,
  controller,
  httpDelete,
} from 'inversify-express-utils';
import { Response } from 'express';

import TYPES from '../../utilities/types';
import { controllerPaginationHelper } from '../../utilities/utils';
import ProfileType from '../../enumerators/profile-type';

import authenticate from '../middlewares/authenticate'
import authorize from '../middlewares/authorization';

import EventEntity from '../../db/entities/event';
import { IEventService } from '../../services/interfaces/event';

import { ICustomRequest } from '../../models/custom-request';
import { eventMapToEntity } from '../../models/mappers/event';
import { AdditionalInformation } from '../../models/user';
import { Pagination, ISearchParameterEvent } from '../../models/pagination';

import {
  eventCreateRouteValidation,
  eventGetByIdRouteValidation,
  eventGetWithPaginationRouteValidation,
  eventUpdateByIdRouteValidation,
  eventDeleteByIdRouteValidation,
} from '../validation/event';
import { validationRoute } from '../../utilities/errors/validation';

@controller('/event')
export class EventController extends BaseHttpController implements interfaces.Controller {

  constructor(
    @inject(TYPES.EventService)
    private eventService: IEventService,
  ) {
    super();
  }

  @httpPost('/',
    authenticate,
    authorize([ProfileType.PROMOTER]),
    ...eventCreateRouteValidation
  )
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)

    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }

    return await this.eventService.create(eventMapToEntity(req.body), additionalInformation);
  }

  @httpGet('/myEvents',
    authenticate,
    authorize([ProfileType.ADMIN, ProfileType.PROMOTER])
  )
  private async myEvents(req: ICustomRequest, res: Response): Promise<Pagination<EventEntity> | any> {
    const searchParameter: ISearchParameterEvent = {
      ...req.query && req.query.name && {
        name: req.query.name.toString(),
      },
      promoter: req.user.id,
      ...controllerPaginationHelper(req),
    };
    return await this.eventService.getWithPagination(searchParameter, true);
  }

  @httpGet(
    '/:id',
    authenticate,
    ...eventGetByIdRouteValidation
  )
  private async getById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    return await this.eventService.getById(req.params.id);
  }

  @httpGet('/',
    authenticate,
    ...eventGetWithPaginationRouteValidation
  )
  private async getWithPagination(req: ICustomRequest, res: Response): Promise<Pagination<EventEntity> | any> {
    validationRoute(req, res)
    const searchParameter: ISearchParameterEvent = {
      ...req.query && req.query.name && {
        name: req.query.name.toString(),
      },
      ...req.query && req.query.promoter && {
        promoter: req.query.promoter.toString(),
      },
      ...controllerPaginationHelper(req),
    };
    return await this.eventService.getWithPagination(searchParameter, false);
  }

  @httpPut('/:id',
    authenticate,
    authorize([ProfileType.ADMIN, ProfileType.PROMOTER]),
    ...eventUpdateByIdRouteValidation
  )
  private async updateById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    if (Object.keys(req.body).length === 0) {
      return res.sendStatus(204)
    }
    //req.body.limitByParticipant = req.body.limitByParticipant.toLowerCase() == "true"
    const event = eventMapToEntity(req.body);
    event.id = req.params.id;
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.eventService.updateById(event, additionalInformation);
  }

  @httpDelete('/:id',
    authenticate,
    authorize([ProfileType.ADMIN, ProfileType.PROMOTER]),
    ...eventDeleteByIdRouteValidation
  )
  private async deleteById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.eventService.deleteById(req.params.id, additionalInformation);
  }
}
