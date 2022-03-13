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
import { check, param, validationResult } from 'express-validator'

import BusinessError, { ValidationErrorCodes } from '../../utilities/errors/business'
import authenticate from '../middlewares/authenticate'
import authorize from '../middlewares/authorization';
import TYPES from '../../utilities/types';
import { IEventService } from '../../services/interfaces/event';
import EventEntity from '../../db/entities/event';
import { controllerPaginationHelper } from '../../utilities/utils';
import { Pagination, ISearchParameterEvent } from '../../models/pagination';
import { ICustomRequest } from '../../models/custom-request';
import { AdditionalInformation } from '../../models/user';
import { eventMapToEntity } from '../../models/mappers/event';
import ProfileType from '../../enumerators/profile-type';
import EventStatus from '../../enumerators/event-status';

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
    check('name')
      .exists({ checkFalsy: true, checkNull: true })
      .not()
      .isEmpty()
      .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
    check('address')
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
    check('startDate')
      .isISO8601()
      .withMessage(ValidationErrorCodes.INVALID_DATETIME)
      .custom(value => {
        const startDate = new Date(value);
        const todaysDate = new Date();
        if (startDate <= todaysDate) {
          throw new BusinessError(ValidationErrorCodes.DATE_IN_PAST);
        }
        return true;
      }),
    check('endDate')
      .isISO8601()
      .withMessage(ValidationErrorCodes.INVALID_DATETIME)
      .custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (startDate >= endDate) {
          throw new BusinessError(ValidationErrorCodes.END_DATE_GT_START_DATE);
        }
        return true;
      }),
    check('tickets')
      .isInt({ gt: 0 })
      .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT),
    check('limitByParticipant')
      .isBoolean()
      .withMessage(ValidationErrorCodes.REQUIRED_FIELD)
  )
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }

    return await this.eventService.create(eventMapToEntity(req.body), additionalInformation);
  }

  @httpGet(
    '/:id',
    authenticate,
    param('id')
      .isUUID()
      .withMessage(ValidationErrorCodes.INVALID_UUID)
  )
  private async getById(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return await this.eventService.getById(req.params.id);
  }

  @httpGet('/',
    authenticate,
    param('promoter')
      .optional({ checkFalsy: false })
      .isUUID()
      .withMessage(ValidationErrorCodes.INVALID_UUID)
  )
  private async getWithPagination(req: ICustomRequest, res: Response): Promise<Pagination<EventEntity> | any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const searchParameter: ISearchParameterEvent = {
      ...req.query && req.query.name && {
        name: req.query.name.toString(),
      },
      ...req.query && req.query.promoter && {
        promoter: req.query.promoter.toString(),
      },
      ...controllerPaginationHelper(req),
    };
    return await this.eventService.getWithPagination(searchParameter);
  }

  @httpPut('/:id',
    authenticate,
    authorize([ProfileType.ADMIN, ProfileType.PROMOTER]),
    check('date')
      .optional({ checkFalsy: false })
      .isDate()
      .withMessage(ValidationErrorCodes.INVALID_DATETIME),
    check('tickets')
      .optional({ checkFalsy: false })
      .isInt({ gt: 0 })
      .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT),
    check('limitByParticipant')
      .optional({ checkFalsy: false })
      .isBoolean()
      .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
    check('status')
      .optional({ checkFalsy: false })
      .isIn([EventStatus.CANCELLED, EventStatus.CLOSED, EventStatus.FORSALE])
      .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
  )
  private async updateById(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (Object.keys(req.body).length === 0) {
      return res.sendStatus(204)
    }
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
    param('id')
      .isUUID()
      .withMessage(ValidationErrorCodes.INVALID_UUID)
  )
  private async deleteById(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.eventService.deleteById(req.params.id, additionalInformation);
  }
}
