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

import { IUserService } from '../../services/interfaces/user';
import TYPES from '../../utilities/types';
import UserEntity from '../../db/entities/user';
import { controllerPaginationHelper } from '../../utilities/utils';
import { Pagination, ISearchParameterUser } from '../../models/pagination';
import { ICustomRequest } from '../../models/custom-request';
import { AdditionalInformation } from '../../models/user';
import { userMapToEntity } from '../../models/mappers/user';
import { ErrorCodes } from '../../utilities/errors/business'
import authenticate from '../middlewares/authenticate'

@controller('/user')
export class UserController extends BaseHttpController implements interfaces.Controller {

  constructor(
    @inject(TYPES.UserService)
    private userService: IUserService,
  ) {
    super();
  }

  @httpPost('/')
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    if (req.user) return res.send(403).send(ErrorCodes.USER_BLOCKED)

    return await this.userService.create(userMapToEntity(req.body));
  }

  @httpGet('/me', authenticate)
  private getMe(req: ICustomRequest): Promise<any> {
    return this.userService.getById(req.user.id);
  }

  @httpGet('/:id', authenticate)
  private getById(req: ICustomRequest): Promise<any> {
    return this.userService.getById(req.params.id);
  }

  @httpGet('/', authenticate)
  private getWithPagination(req: ICustomRequest): Promise<Pagination<UserEntity>> {
    const searchParameter: ISearchParameterUser = {
      ...req.query && req.query.name && {
        name: req.query.name.toString(),
      },
      ...req.query && req.query.email && {
        email: req.query.email.toString(),
      },
      ...req.query && req.query.profileType && {
        profileType: req.query.profileType.toString().split(','),
      },
      ...controllerPaginationHelper(req),
    };
    return this.userService.getWithPagination(searchParameter);
  }

  @httpPut('/:id', authenticate)
  private updateById(req: ICustomRequest): Promise<any> {
    const user = userMapToEntity(req.body);
    user.id = req.params.id;
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return this.userService.updateById(user, additionalInformation);
  }

  @httpDelete('/:id', authenticate)
  private deleteById(req: ICustomRequest): Promise<any> {
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return this.userService.deleteById(req.params.id, additionalInformation);
  }
}
