import { inject } from 'inversify';
import {
  httpPost,
  BaseHttpController,
  interfaces,
  controller,
  httpGet,
} from 'inversify-express-utils';

import { Request, Response } from 'express';
//import httpStatus from 'http-status';
import { check, cookie, validationResult } from 'express-validator';
import * as httpStatus from 'http-status';



import TYPES from '../../utilities/types';

import { IUserCredentialService } from '../../services/interfaces/user-credential';
import { ICustomRequest } from '../../models/custom-request';
import { IAccessTokenAndRefreshToken } from '../../models/user-credential';
import { ValidationErrorCodes } from '../../utilities/errors/business';

@controller('/user-credential')
export class UserCredentialController extends BaseHttpController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserCredentialService)
    private userCredentialService: IUserCredentialService,
  ) {
    super();
  }

  @httpPost('/auth',
    check('email')
      .isEmail()
      .withMessage(ValidationErrorCodes.INVALID_EMAIL),
    check('password')
      .isLength({ min: 8 })
      .withMessage(ValidationErrorCodes.PASSWORD_MIN_LENGTH)
  )
  private async auth(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const tokens: IAccessTokenAndRefreshToken = await this.userCredentialService
      .authenticate(
        req.body.email as string,
        req.body.password as string
      );
    res.cookie('token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: false
    })
    return res.status(200).json({ token: tokens.accessToken })
  }

  @httpPost('/refresh',
    cookie('token').isJWT().withMessage(ValidationErrorCodes.INVALID_TOKEN)
  )
  private async refresh(req: ICustomRequest, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { cookies } = req
    if (!cookies?.token) return res.sendStatus(httpStatus.UNAUTHORIZED)
    const refreshToken = cookies.token.toString()
    const token = await this.userCredentialService.refeshToken(refreshToken)
    return res.status(200).json({ token })
  }

  @httpGet('/logout',
    cookie('token').isJWT().withMessage(ValidationErrorCodes.INVALID_TOKEN)
  )
  private async logout(req: Request, res: Response): Promise<any> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { cookies } = req
    if (!cookies?.token) return res.sendStatus(httpStatus.UNAUTHORIZED)
    res.clearCookie('token', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: false
    })
    return res.sendStatus(204)
  }
}