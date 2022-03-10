import { inject } from 'inversify';
import {
  httpPost,
  BaseHttpController,
  interfaces,
  controller,
} from 'inversify-express-utils';

import { Response } from 'express';
import httpStatus from 'http-status';

import TYPES from '../../utilities/types';

import { IUserCredentialService } from '../../services/interfaces/user-credential';
import { ICustomRequest } from '../../models/custom-request';
import { IAccessTokenAndRefreshToken } from '../../models/user-credential';

@controller('/user-credential')
export class UserCredentialController extends BaseHttpController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserCredentialService)
    private userCredentialService: IUserCredentialService,
  ) {
    super();
  }

  @httpPost('/auth')
  private async auth(req: ICustomRequest, res: Response): Promise<any> {
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

  @httpPost('/refresh')
  private async refresh(req: ICustomRequest, res: Response): Promise<any> {
    const { cookies } = req
    if (!cookies?.token) return res.sendStatus(httpStatus.UNAUTHORIZED)
    const refreshToken = cookies.token.toString()
    const token = await this.userCredentialService.refeshToken(refreshToken)
    return res.status(200).json({ token })
  }
}