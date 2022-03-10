import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes } from '../utilities/errors/business';

import { ConstantsEnv } from '../constants';

import { IUserCredentialService } from './interfaces/user-credential';

import { compare, hash } from 'bcrypt';
import { JwtPayload, sign, verify, VerifyErrors } from 'jsonwebtoken'

import { IAccessTokenAndRefreshToken } from '../models/user-credential';
import { IUserRepository } from 'db/repositories/interfaces/user';
import { AdditionalInformation } from '../models/user';
import { userMapToDTO } from '../models/mappers/user';
import UserEntity from '../db/entities/user';

@injectable()
export class UserCredentialService implements IUserCredentialService {
  private userRepository: IUserRepository;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository
  ) {
    this.userRepository = userRepository;
  }

  async authenticate(email: string, password: string): Promise<IAccessTokenAndRefreshToken> {
    let response: IAccessTokenAndRefreshToken = null;
    const existUser = await this.userRepository.selectOneByOptions({ where: { email } });
    if (!existUser || !await compare(password, existUser.password)) {
      throw new BusinessError(ErrorCodes.INVALID_CREDENTIALS);
    }
    const accessToken = sign({}, ConstantsEnv.auth.accessTokenSecret, {
      subject: existUser.id,
      expiresIn: ConstantsEnv.auth.accessTokenExpiration
    })
    const refreshToken = sign({}, ConstantsEnv.auth.refreshTokenSecret, {
      subject: existUser.id,
      expiresIn: ConstantsEnv.auth.refreshTokenExpiration
    })
    response = { accessToken, refreshToken };
    return response;
  }

  async refeshToken(token: string): Promise<string> {
    let decodedSub: string = null
    verify(
      token,
      ConstantsEnv.auth.refreshTokenSecret,
      (
        error: VerifyErrors,
        decoded: JwtPayload
      ) => {
        if (error || !decoded.sub) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);
        decodedSub = decoded.sub.toString()
      })
    const existUser = await this.userRepository.selectOneByOptions({
      where: {
        id: decodedSub,
        deletedAt: null
      }
    });
    const newToken = sign({}, ConstantsEnv.auth.accessTokenSecret, {
      subject: existUser.id,
      expiresIn: ConstantsEnv.auth.accessTokenExpiration
    })
    return newToken;
  }
}
