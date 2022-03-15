import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes, ValidationErrorCodes } from '../utilities/errors/business';
import { ILike } from 'typeorm';

import EventEntity from '../db/entities/event';
import { IEventRepository } from '../db/repositories/interfaces/event';
import { IEventService } from './interfaces/event';
import { Pagination, ISearchParameterEvent } from '../models/pagination';

import { AdditionalInformation } from '../models/user';
import EventStatus from '../enumerators/event-status';

@injectable()
export class EventService implements IEventService {
  private eventRepository: IEventRepository;

  constructor(
    @inject(TYPES.EventRepository) eventRepository: IEventRepository,
  ) {
    this.eventRepository = eventRepository;
  }

  async getById(eventId: string, additionalInformation: AdditionalInformation): Promise<EventEntity> {
    const { actor } = additionalInformation;
    const event = await this.eventRepository.selectById(eventId);
    if (actor.id !== event.promoter.id) delete (event.ticketsSold);
    if (!event) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)
    return event;
  }

  async create(event: EventEntity, additionalInformation: AdditionalInformation): Promise<EventEntity> {

    const { actor } = additionalInformation

    const existEvent = await this.eventRepository.selectByWhere({
      where: {
        name: ILike(`${event.name}`),
        status: EventStatus.FORSALE
      }
    })

    if (existEvent.length !== 0) throw new BusinessError(ErrorCodes.EVENT_ALREADY_EXISTS)

    const eventToSave = {
      promoter: actor,
      name: event.name,
      address: event.address,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      tickets: event.tickets,
      ticketPrice: event.ticketPrice,
      limitByParticipant: event.limitByParticipant,
      createdBy: (actor && actor.id) || 'SYSTEM',
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };

    const eventSaved = await this.eventRepository.create(eventToSave);

    return eventSaved;
  }

  async getWithPagination(searchParameter: ISearchParameterEvent | null, samePromoter: boolean):
    Promise<Pagination<EventEntity> | null> {
    const response = await this.eventRepository.selectPagination(searchParameter, samePromoter);
    return response;
  }

  async updateById(eventUpdateRequest: EventEntity, additionalInformation: AdditionalInformation): Promise<EventEntity | null> {
    const { actor } = additionalInformation;

    const existEvent = await this.eventRepository.selectById(eventUpdateRequest.id)

    if (!existEvent) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)

    const existEvents = await this.eventRepository.selectByWhere({
      where: {
        name: ILike(`${eventUpdateRequest.name}`),
        status: EventStatus.FORSALE
      }
    })

    if (existEvents.length !== 0) throw new BusinessError(ErrorCodes.EVENT_ALREADY_EXISTS)

    if (eventUpdateRequest.tickets && existEvent.ticketsSold > eventUpdateRequest.tickets) throw new BusinessError(ValidationErrorCodes.INVALID_TICKET_QNT)

    const eventToUpdate: EventEntity = {
      ...eventUpdateRequest.name !== undefined && eventUpdateRequest.name !== existEvent.name && { name: eventUpdateRequest.name },
      ...eventUpdateRequest.address !== undefined && { address: eventUpdateRequest.address },
      ...eventUpdateRequest.description !== undefined && { description: eventUpdateRequest.description },
      ...eventUpdateRequest.startDate !== undefined && { startDate: eventUpdateRequest.startDate },
      ...eventUpdateRequest.endDate !== undefined && { endDate: eventUpdateRequest.endDate },
      ...eventUpdateRequest.tickets !== undefined && { tickets: eventUpdateRequest.tickets },
      ...eventUpdateRequest.ticketPrice !== undefined && { ticketPrice: eventUpdateRequest.ticketPrice },
      ...eventUpdateRequest.limitByParticipant !== undefined && { limitByParticipant: eventUpdateRequest.limitByParticipant },
      ...eventUpdateRequest.status !== undefined && { status: eventUpdateRequest.status },
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };

    await this.eventRepository.updateById(eventUpdateRequest.id, eventToUpdate)
    const response = await this.getById(eventUpdateRequest.id, additionalInformation);
    return response;
  }

  async deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean> {
    const { actor } = additionalInformation
    const event = await this.getById(id, additionalInformation);

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