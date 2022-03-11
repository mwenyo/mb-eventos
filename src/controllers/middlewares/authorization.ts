import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { ICustomRequest } from 'models/custom-request';

export default function authorize(profileList: number[]) {
  return (req: ICustomRequest, res: Response, next: NextFunction) => {
    const hasAccess = req.user && profileList.find(profileType => profileType === req.user.profileType);
    return hasAccess ? next() : res.sendStatus(httpStatus.FORBIDDEN);
  };
}
