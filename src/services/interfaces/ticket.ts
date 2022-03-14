import TicketEntity from '../../db/entities/ticket';
import { Pagination, ISearchParameterBase } from '../../models/pagination';
import { AdditionalInformation } from '../../models/user';
import { TicketDTO } from '../../models/ticket';

export interface ITicketService {
  create(quantity: number, event: string, additionalInformation: AdditionalInformation): Promise<TicketDTO[]>;
  getById(id: string): Promise<TicketDTO>;
  getWithPagination(searchParameter: ISearchParameterBase, samePromoter: boolean):
    Promise<Pagination<TicketDTO>>;
  updateById(ticket: TicketEntity, additionalInformation: AdditionalInformation):
    Promise<TicketDTO>;
  deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean>;
}
