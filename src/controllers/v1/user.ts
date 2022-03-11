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
import { cpf, cnpj } from 'cpf-cnpj-validator';

import BusinessError, { ErrorCodes, ValidationErrorCodes } from '../../utilities/errors/business'
import authenticate from '../middlewares/authenticate'
import authorize from '../middlewares/authorization';
import TYPES from '../../utilities/types';
import { IUserService } from '../../services/interfaces/user';
import UserEntity from '../../db/entities/user';
import { controllerPaginationHelper } from '../../utilities/utils';
import { Pagination, ISearchParameterUser } from '../../models/pagination';
import { ICustomRequest } from '../../models/custom-request';
import { AdditionalInformation } from '../../models/user';
import { userMapToEntity } from '../../models/mappers/user';
import ProfileType from '../../enumerators/profile-type';

@controller('/user')
export class UserController extends BaseHttpController implements interfaces.Controller {

  constructor(
    @inject(TYPES.UserService)
    private userService: IUserService,
  ) {
    super();
  }

  @httpPost('/',
    check('name').exists({ checkFalsy: true, checkNull: true }).withMessage(ValidationErrorCodes.REQUIRED_FIELD)
    ,
    check('email')
      .isEmail()
      .withMessage(ValidationErrorCodes.INVALID_EMAIL),
    check('profileType')
      .isIn([
        ProfileType.PARTICIPANT,
        ProfileType.PROMOTER
      ])
      .withMessage(ValidationErrorCodes.INVALID_PROFILE_TYPE),
    check('password')
      .isLength({ min: 8 })
      .withMessage(ValidationErrorCodes.PASSWORD_MIN_LENGTH),
    check('passwordConfirmation')
      .isLength({ min: 8 })
      .withMessage(ValidationErrorCodes.PASSWORD_CONFIRMATION_MIN_LENGTH)
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new BusinessError(ValidationErrorCodes.PASSWORDS_DONT_MATCH);
        }
        return true;
      }),
    check('cpfCnpj').custom((value, { req }) => {
      if ((parseInt(req.body.profileType) === ProfileType.PARTICIPANT) && (!cpf.isValid(value))) {
        throw new BusinessError(ValidationErrorCodes.INVALID_CPF);
      }

      if ((parseInt(req.body.profileType) === ProfileType.PROMOTER) && (!cnpj.isValid(value))) {
        throw new BusinessError(ValidationErrorCodes.INVALID_CNPJ);
      }
      return true;
    })
  )
  private async create(req: ICustomRequest, res: Response): Promise<any> {
    if (req.cookies.token) return res.status(400).json({ error: ErrorCodes.USER_BLOCKED })

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return await this.userService.create(userMapToEntity(req.body));
  }

  @httpGet('/me', authenticate)
  private async getMe(req: ICustomRequest): Promise<any> {
    return await this.userService.getById(req.user.id);
  }

  @httpGet(
    '/:id',
    authenticate,
    authorize([ProfileType.ADMIN]),
    param('id')
      .isUUID()
      .withMessage(ValidationErrorCodes.INVALID_UUID)
  )
  private async getById(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return await this.userService.getById(req.params.id);
  }

  @httpGet('/',
    authenticate,
    authorize([ProfileType.ADMIN]),
    param('email')
      .optional({ checkFalsy: false })
      .isEmail()
      .withMessage(ValidationErrorCodes.INVALID_EMAIL),
    param('profileType')
      .optional({ checkFalsy: false })
      .isIn([
        ProfileType.ADMIN,
        ProfileType.PARTICIPANT,
        ProfileType.PROMOTER
      ])
  )
  private async getWithPagination(req: ICustomRequest, res: Response): Promise<Pagination<UserEntity> | any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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
    param('id')
      .isUUID()
      .withMessage(ValidationErrorCodes.INVALID_UUID),
    check('name')
      .optional({ checkFalsy: false }),
    check('email')
      .optional({ checkFalsy: false })
      .isEmail()
      .withMessage(ValidationErrorCodes.INVALID_EMAIL),
    check('cpfCnpj')
      .optional({ checkFalsy: false })
      .custom((value, { req }) => {
        if ((!cnpj.isValid(value)) && (!cpf.isValid(value))) {
          throw new BusinessError(ValidationErrorCodes.INVALID_CPF_OR_CNPJ);
        }
        return true;
      }),
  )
  private async updateById(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (Object.keys(req.body).length === 0) {
      return res.sendStatus(204)
    }
    const user = userMapToEntity(req.body);
    user.id = req.params.id;
    const additionalInformation: AdditionalInformation = {
      actor: req.user,
    }
    return await this.userService.updateById(user, additionalInformation);
  }

  @httpDelete('/:id',
    authenticate,
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
    return await this.userService.deleteById(req.params.id, additionalInformation);
  }
}
