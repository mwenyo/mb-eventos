import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes } from '../utilities/errors/business';

import EventEntity from '../db/entities/event';
import { IEventRepository } from '../db/repositories/interfaces/event';
import { IEventService } from './interfaces/event';
import { EventDTO } from '../models/event';

import { Pagination, ISearchParameterEvent } from '../models/pagination';
import { AdditionalInformation } from '../models/user';
import { eventMapToDTO } from '../models/mappers/event';

@injectable()
export class EventService implements IEventService {
  private eventRepository: IEventRepository;

  constructor(
    @inject(TYPES.EventRepository) eventRepository: IEventRepository,
  ) {
    this.eventRepository = eventRepository;
  }

  async getById(eventId: string): Promise<EventDTO> {
    const event = await this.eventRepository.selectById(eventId);
    if (!event) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)
    return event;
  }


  async create(event: EventEntity, additionalInformation: AdditionalInformation): Promise<EventDTO> {

    const { actor } = additionalInformation

    const eventToSave = {
      promoter: actor,
      name: event.name,
      address: event.address,
      date: event.date,
      tickets: event.tickets,
      limitByParticipant: event.limitByParticipant,
      createdBy: (actor && actor.id) || 'SYSTEM',
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };

    const eventSaved = await this.eventRepository.create(eventToSave);

    return eventMapToDTO(eventSaved);
  }

  async getWithPagination(searchParameter: ISearchParameterEvent | null):
    Promise<Pagination<EventDTO> | null> {
    const response = await this.eventRepository.selectPagination(searchParameter);
    return response;
  }

  async updateById(event: EventEntity, additionalInformation: AdditionalInformation): Promise<EventDTO | null> {
    const { actor } = additionalInformation;

    const existEvent = await this.getById(event.id)

    if (!existEvent) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)

    const eventToUpdate = {
      ...event.name && { event: event.name },
      ...event.address && { event: event.address },
      ...event.date && { event: event.date },
      ...event.tickets && { event: event.tickets },
      ...event.limitByParticipant && { event: event.limitByParticipant },
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };

    await this.eventRepository.updateById(event.id, eventToUpdate)
    const response = await this.getById(event.id);
    return eventMapToDTO(response);
  }

  async deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean> {
    const { actor } = additionalInformation
    const event = await this.getById(id);

    if (!event) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)

    const eventToSave = {
      deletedBy: (actor && actor.id) || 'SYSTEM',
      deletedAt: new Date(),
    };

    await this.eventRepository.updateById(id, eventToSave)

    await this.eventRepository.deleteById(id);
    return true;
  }
}