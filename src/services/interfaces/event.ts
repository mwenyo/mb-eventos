import { Pagination, ISearchParameterBase } from '../../models/pagination';
import EventEntity from '../../db/entities/event';

import UserEntity from '../../db/entities/user';

export interface IEventService {
  create(event: EventEntity, actor: UserEntity): Promise<EventEntity>;
  getById(id: string, actor: UserEntity): Promise<EventEntity>;
  getWithPagination(searchParameter: ISearchParameterBase, samePromoter: boolean):
    Promise<Pagination<EventEntity>>;
  updateById(event: EventEntity, actor: UserEntity):
    Promise<EventEntity>;
  deleteById(id: string, actor: UserEntity): Promise<boolean>;
}
