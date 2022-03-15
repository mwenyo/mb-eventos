import TicketEntity from '../../db/entities/ticket';
import { Pagination, ISearchParameterBase } from '../../models/pagination';
import { AdditionalInformation } from '../../models/user';

export interface ITicketService {
  getById(ticketId: string, additionalInformation: AdditionalInformation): Promise<TicketEntity>;
  create(quantity: number, event: string, additionalInformation: AdditionalInformation): Promise<TicketEntity[]>;
  getWithPagination(searchParameter: ISearchParameterBase, additionalInformation: AdditionalInformation):
    Promise<Pagination<TicketEntity>>;
  updateById(ticket: string, status: number, additionalInformation: AdditionalInformation):
    Promise<TicketEntity>;
}
