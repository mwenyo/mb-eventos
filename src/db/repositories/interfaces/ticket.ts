import TicketEntity from '../../entities/ticket';
import { Pagination, ISearchParameterBase } from '../../../models/pagination';
import { FindOneOptions, UpdateResult } from 'typeorm';

export interface ITicketRepository {
  create(ticket: TicketEntity[]): Promise<TicketEntity[]>;
  selectPagination(searchParameter: ISearchParameterBase): Promise<Pagination<TicketEntity>>;
  selectById(id: string, options?: FindOneOptions<TicketEntity>): Promise<TicketEntity | null>;
  selectOneByOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null>;
  updateById(id: string, ticket: TicketEntity): Promise<UpdateResult>;
}
