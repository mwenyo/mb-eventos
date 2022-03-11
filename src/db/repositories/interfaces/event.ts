import EventEntity from '../../entities/event';
import { Pagination, ISearchParameterBase } from '../../../models/pagination';
import { DeleteResult, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';

export interface IEventRepository {
  create(event: EventEntity): Promise<EventEntity>;
  selectById(id: string, options?: FindOneOptions<EventEntity>): Promise<EventEntity | null>;
  updateById(id: string, event: EventEntity): Promise<UpdateResult>;
  selectByIdList(idList: string[]): Promise<EventEntity[] | null>;
  selectByWhere(where: FindManyOptions<EventEntity>): Promise<EventEntity[] | null>;
  selectOneByOptions(options: FindOneOptions<EventEntity>): Promise<EventEntity | null>;
  selectPagination(searchParameter: ISearchParameterBase): Promise<Pagination<EventEntity>>;
  selectAllByOptions(options: FindManyOptions<EventEntity>): Promise<EventEntity[] | null>;
  deleteById(id: string): Promise<DeleteResult>;
}
