import httpStatus from 'http-status';
import { Response, NextFunction } from 'express';
import { getRepository, Repository } from 'typeorm';
import { verify } from 'jsonwebtoken';

import { ICustomRequest } from '../../models/custom-request';
import UserEntity from '../../db/entities/user';
import { ConstantsEnv } from '../../constants';

export default async function (
  req: ICustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> {
  if (!req.headers || !req.headers.authorization) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
  const [, token] = req.headers.authorization.split(' ');
  if (!token) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }

  verify(token, ConstantsEnv.auth.accessTokenSecret, async (error: any, decoded: any) => {
    if (error || !decoded.sub) return res.sendStatus(httpStatus.UNAUTHORIZED);
    const userRepository: Repository<UserEntity> = getRepository(UserEntity);

    const user: UserEntity = await userRepository.findOne({
      where: {
        id: decoded.sub.toString(),
        deletedAt: null,
      },
    });

    if (!user) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    req.user = user;
    return req.user ? next() : res.sendStatus(httpStatus.UNAUTHORIZED);
  });
}
