import TicketEntity from '../../db/entities/ticket';
import { Pagination, ISearchParameterBase } from '../../models/pagination';
import { AdditionalInformation } from '../../models/user';
import { TicketDTO } from '../../models/ticket';

export interface ITicketService {
  create(quantity: number, event: string, additionalInformation: AdditionalInformation): Promise<TicketDTO[]>;
  getById(ticketId: string, additionalInformation: AdditionalInformation): Promise<TicketDTO>;
  getWithPagination(searchParameter: ISearchParameterBase, additionalInformation: AdditionalInformation):
    Promise<Pagination<TicketDTO>>;
  updateById(ticket: string, status: number, additionalInformation: AdditionalInformation):
    Promise<TicketDTO>;
}
