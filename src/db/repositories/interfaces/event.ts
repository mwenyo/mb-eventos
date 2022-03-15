import EventEntity from '../../entities/event';
import { Pagination, ISearchParameterBase } from '../../../models/pagination';
import { DeleteResult, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';

export interface IEventRepository {
  create(event: EventEntity): Promise<EventEntity>;
  selectById(id: string, options?: FindOneOptions<EventEntity>): Promise<EventEntity | null>;
  updateById(id: string, event: EventEntity): Promise<EventEntity>;
  selectByWhere(where: FindManyOptions<EventEntity>): Promise<EventEntity[] | null>;
  selectPagination(searchParameter: ISearchParameterBase, samePromoter: boolean): Promise<Pagination<EventEntity>>;
  deleteById(id: string): Promise<DeleteResult>;
  decreaseEventTicketSold(event: EventEntity): Promise<EventEntity>;
  increaseEventTicketSold(event: EventEntity, quantity: number): Promise<EventEntity>;
}
