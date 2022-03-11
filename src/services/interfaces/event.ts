import { Pagination, ISearchParameterBase } from '../../models/pagination';
import EventEntity from '../../db/entities/event';
import { AdditionalInformation } from '../../models/user';
import { EventDTO } from '../../models/event';

export interface IEventService {
  create(event: EventEntity, additionalInformation: AdditionalInformation): Promise<EventDTO>;
  getById(id: string): Promise<EventDTO>;
  getWithPagination(searchParameter: ISearchParameterBase):
    Promise<Pagination<EventDTO>>;
  updateById(id: string, event: EventEntity, additionalInformation: AdditionalInformation):
    Promise<EventDTO>;
  deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean>;
}