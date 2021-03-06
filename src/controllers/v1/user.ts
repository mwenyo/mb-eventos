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
import { ErrorCodes } from '../../utilities/errors/business'
import { controllerPaginationHelper } from '../../utilities/utils';
import ProfileType from '../../enumerators/profile-type';

import authenticate from '../middlewares/authenticate'
import authorize from '../middlewares/authorization';

import UserEntity from '../../db/entities/user';
import { IUserService } from '../../services/interfaces/user';

import { Pagination, ISearchParameterUser } from '../../models/pagination';
import { ICustomRequest } from '../../models/custom-request';

import {
  userCreateAdminRouteValidation,
  userCreateRouteValidation,
  userDeleteByIdRouteValidation,
  userGetByIdRouteValidation,
  userGetWithPaginationRouteValidation,
  userUpdateByIdRouteValidation
} from '../validation/user';
import { validationRoute } from '../../utilities/errors/validation';

@controller('/user')
export class UserController extends BaseHttpController implements interfaces.Controller {

  constructor(
    @inject(TYPES.UserService)
    private userService: IUserService,
  ) {
    super();
  }

  @httpPost('/',
    ...userCreateRouteValidation
  )
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    if (req.cookies.token) return res.status(400).json({ error: ErrorCodes.USER_BLOCKED });

    validationRoute(req, res);
    const user: UserEntity = req.body;

    return await this.userService.create(user);
  }
  @httpPost('/admin',
    authenticate,
    authorize([ProfileType.ADMIN]),
    ...userCreateAdminRouteValidation
  )
  private async createAdmin(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res);
    const user: UserEntity = req.body;
    const actor = req.user;
    return await this.userService.createAdmin(user, actor);
  }

  @httpGet('/me', authenticate)
  private async getMe(req: ICustomRequest): Promise<any> {
    return await this.userService.getById(req.user.id);
  }

  @httpGet(
    '/:id',
    authenticate,
    authorize([ProfileType.ADMIN]),
    ...userGetByIdRouteValidation
  )
  private async getById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    return await this.userService.getById(req.params.id);
  }

  @httpGet('/',
    authenticate,
    authorize([ProfileType.ADMIN]),
    ...userGetWithPaginationRouteValidation
  )
  private async getWithPagination(req: ICustomRequest, res: Response): Promise<Pagination<UserEntity> | any> {
    validationRoute(req, res)
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
    return await this.userService.getWithPagination(searchParameter);
  }

  @httpPut('/:id',
    authenticate,
    ...userUpdateByIdRouteValidation
  )
  private async updateById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    if (Object.keys(req.body).length === 0) {
      return res.sendStatus(204)
    }
    const user: UserEntity = req.body;
    user.id = req.params.id;
    const actor = req.user;
    return await this.userService.updateById(user, actor);
  }

  @httpDelete('/:id',
    authenticate,
    ...userDeleteByIdRouteValidation
  )
  private async deleteById(req: ICustomRequest, res: Response): Promise<any> {
    validationRoute(req, res)
    const actor = req.user;
    return await this.userService.deleteById(req.params.id, actor);
  }
}
