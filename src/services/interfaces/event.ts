import { Pagination, ISearchParameterBase } from '../../models/pagination';
import EventEntity from '../../db/entities/event';
import { AdditionalInformation } from '../../models/user';

export interface IEventService {
  create(event: EventEntity, additionalInformation: AdditionalInformation): Promise<EventEntity>;
  getById(id: string, additionalInformation: AdditionalInformation): Promise<EventEntity>;
  getWithPagination(searchParameter: ISearchParameterBase, samePromoter: boolean):
    Promise<Pagination<EventEntity>>;
  updateById(event: EventEntity, additionalInformation: AdditionalInformation):
    Promise<EventEntity>;
  deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean>;
}
