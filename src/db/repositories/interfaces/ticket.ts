import TicketEntity from '../../entities/ticket';
import { Pagination, ISearchParameterBase } from '../../../models/pagination';
import { DeleteResult, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';

export interface ITicketRepository {
  create(ticket: TicketEntity[]): Promise<TicketEntity[]>;
  selectById(id: string, options?: FindOneOptions<TicketEntity>): Promise<TicketEntity | null>;
  updateById(id: string, ticket: TicketEntity): Promise<UpdateResult>;
  selectByWhere(where: FindManyOptions<TicketEntity>): Promise<TicketEntity[] | null>;
  selectOneByOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null>;
  selectPagination(searchParameter: ISearchParameterBase): Promise<Pagination<TicketEntity>>;
  selectAllByOptions(options: FindManyOptions<TicketEntity>): Promise<TicketEntity[] | null>;
}
