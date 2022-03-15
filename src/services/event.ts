import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes, ValidationErrorCodes } from '../utilities/errors/business';
import { ILike } from 'typeorm';

import EventEntity from '../db/entities/event';
import { IEventRepository } from '../db/repositories/interfaces/event';
import { IEventService } from './interfaces/event';
import { EventDTO } from '../models/event';

import { Pagination, ISearchParameterEvent } from '../models/pagination';
import { AdditionalInformation } from '../models/user';
import { eventMapToDTO } from '../models/mappers/event';
import EventStatus from '../enumerators/event-status';
import { userMapToDTO } from '../models/mappers/user';

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
    eventSaved.promoter = userMapToDTO(eventSaved.promoter)

    return eventMapToDTO(eventSaved);
  }

  async getWithPagination(searchParameter: ISearchParameterEvent | null, samePromoter: boolean):
    Promise<Pagination<EventDTO> | null> {
    const response = await this.eventRepository.selectPagination(searchParameter);
    if (samePromoter) {
      response.rows = response.rows.map(row => {
        delete (row.promoter);
        return row;
      });
    }
    return response;
  }

  async updateById(eventUpdateRequest: EventEntity, additionalInformation: AdditionalInformation): Promise<EventDTO | null> {
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
    const response = await this.getById(eventUpdateRequest.id);
    response.promoter = userMapToDTO(response.promoter)
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