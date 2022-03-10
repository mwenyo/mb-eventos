import { ISearchParameterBase } from '../models/pagination';

export function controllerPaginationHelper(req: any): ISearchParameterBase {
  return {
    offset: req.query.offset
      ? (parseInt(req.query.offset, 10) * (parseInt(req.query.limit || '10', 10)))
      : 0,
    orderBy: req.query.orderBy || 'createdAt',
    isDESC: req.query.isDESC === 'false' ? false : true,
    limit: Math.min(parseInt(req.query.limit || '10', 10), 100),
  };
}