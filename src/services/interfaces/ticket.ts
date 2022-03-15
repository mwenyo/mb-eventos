import TicketEntity from '../../db/entities/ticket';
import { Pagination, ISearchParameterBase } from '../../models/pagination';


export interface ITicketService {
  getById(ticketId: string, actor: UserEntity): Promise<TicketEntity>;
  create(quantity: number, event: string, actor: UserEntity): Promise<TicketEntity[]>;
  getWithPagination(searchParameter: ISearchParameterBase, actor: UserEntity):
    Promise<Pagination<TicketEntity>>;
  updateById(ticket: string, status: number, actor: UserEntity):
    Promise<TicketEntity>;
}
