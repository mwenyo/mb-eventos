import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes } from '../utilities/errors/business';

import TicketEntity from '../db/entities/ticket';
import { ITicketRepository } from '../db/repositories/interfaces/ticket';
import { IEventRepository } from '../db/repositories/interfaces/event';
import { ITicketService } from './interfaces/ticket';
import { TicketDTO } from '../models/ticket';

import TicketStatus from '../enumerators/ticket-status';
import EventStatus from '../enumerators/event-status';
import ProfileType from '../enumerators/profile-type';

import EventEntity from '../db/entities/event';
import { Pagination, ISearchParameterTicket } from '../models/pagination';
import { AdditionalInformation } from '../models/user';

@injectable()
export class TicketService implements ITicketService {
  private ticketRepository: ITicketRepository;
  private eventRepository: IEventRepository;

  constructor(
    @inject(TYPES.TicketRepository) ticketRepository: ITicketRepository,
    @inject(TYPES.EventRepository) eventRepository: IEventRepository
  ) {
    this.ticketRepository = ticketRepository;
    this.eventRepository = eventRepository;
  }

  async getById(ticketId: string, additionalInformation: AdditionalInformation): Promise<TicketDTO> {
    const { actor } = additionalInformation;
    const existTicket = await this.ticketRepository.selectById(ticketId);

    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);

    if ((actor.profileType === ProfileType.PARTICIPANT && existTicket.participant.id !== actor.id) ||
      (actor.profileType === ProfileType.PROMOTER && existTicket.event.promoter.id !== actor.id)
    ) {
      throw new BusinessError(ErrorCodes.USER_BLOCKED);
    }

    return existTicket;
  }

  async create(quantity: number, event: string, additionalInformation: AdditionalInformation): Promise<TicketDTO[]> {
    const { actor } = additionalInformation;
    const existEvent = await this.eventRepository.selectById(event);
    if (!existEvent) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);
    if (existEvent.status !== EventStatus.FORSALE) throw new BusinessError(ErrorCodes.UNAVALIABLE_EVENT);
    if (existEvent.limitByParticipant) {
      const existTicket = await this.ticketRepository.selectOneByOptions({
        where: {
          event: existEvent.id,
          participant: actor.id,
          status: TicketStatus.ACTIVE
        }
      });
      if (existTicket) throw new BusinessError(ErrorCodes.TICKET_LIMIT_REACHED);
    }

    const eventSaved = await this.increaseEventTicketSold(existEvent, quantity);

    const ticketsToSaved: TicketEntity[] = [];
    for (let i = 0; i < quantity; i++) {
      const code = Math.floor(Date.now() * Math.random()).toString(36).toUpperCase();
      const ticketToSave = {
        participant: actor,
        event: eventSaved,
        code,
        status: TicketStatus.ACTIVE,
        createdBy: (actor && actor.id) || 'SYSTEM',
        updatedBy: (actor && actor.id) || 'SYSTEM',
      };
      ticketsToSaved.push(ticketToSave);
    }
    const ticketsSaved = await this.ticketRepository.create(ticketsToSaved);
    return ticketsSaved;
  }

  async getWithPagination(
    searchParameter: ISearchParameterTicket | null,
    additionalInformation: AdditionalInformation
  ): Promise<Pagination<TicketDTO> | null> {
    const { actor } = additionalInformation;
    if (actor.profileType === ProfileType.PARTICIPANT) searchParameter.participant = actor.id;
    if (actor.profileType === ProfileType.PROMOTER) searchParameter.promoter = actor.id;
    const response = await this.ticketRepository.selectPagination(searchParameter);
    return response;
  }

  async updateById(
    ticket: string,
    status: number,
    additionalInformation: AdditionalInformation
  ): Promise<TicketDTO | null> {
    const { actor } = additionalInformation;
    const existTicket = await this.ticketRepository.selectOneByOptions({
      where: {
        id: ticket,
        status: TicketStatus.ACTIVE
      },
      relations: ['event', 'participant', 'event.promoter']
    });
    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);
    if (existTicket.event.status === EventStatus.CANCELLED) throw new BusinessError(ErrorCodes.UNAVALIABLE_EVENT);
    if (((actor.profileType === ProfileType.PARTICIPANT) &&
      (status !== TicketStatus.CANCELLED || existTicket.participant.id !== actor.id)) ||
      (actor.profileType === ProfileType.PROMOTER && existTicket.event.promoter.id !== actor.id) ||
      (existTicket.status === status)
    ) {
      throw new BusinessError(ErrorCodes.USER_BLOCKED);
    }
    if (status === TicketStatus.CANCELLED) {
      await this.decreaseEventTicketSold(existTicket);
    }
    const ticketToUpdate = {
      status,
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };
    await this.ticketRepository.updateById(ticket, ticketToUpdate);
    const response = await this.ticketRepository.selectById(ticket);
    return response;
  }

  private async increaseEventTicketSold(
    event: EventEntity,
    quantity: number
  ): Promise<EventEntity> {
    const updatedTicketSold = event.ticketsSold + quantity;
    const ticketLimitReached = updatedTicketSold > event.tickets;
    if (ticketLimitReached) throw new BusinessError(ErrorCodes.TICKET_LIMIT_REACHED);
    const lastTicketSold = updatedTicketSold === event.tickets;
    const eventToUpdate = {
      ticketsSold: updatedTicketSold,
      ...lastTicketSold && { status: EventStatus.CLOSED },
      updatedBy: 'SYSTEM',
    };
    await this.eventRepository.updateById(event.id, eventToUpdate);
    const eventSaved = await this.eventRepository.selectById(event.id);
    return eventSaved;
  }

  private async decreaseEventTicketSold(ticket: TicketEntity): Promise<TicketEntity> {
    const updatedTicketSold = ticket.event.ticketsSold - 1
    const eventClosed = ticket.event.status === EventStatus.CLOSED;
    const eventToUpdate = {
      ticketsSold: updatedTicketSold,
      ...eventClosed && { status: EventStatus.FORSALE },
      updatedBy: 'SYSTEM',
    };
    await this.eventRepository.updateById(ticket.event.id, eventToUpdate);
    const eventSaved = await this.eventRepository.selectById(ticket.event.id);
    ticket.event = eventSaved;
    return ticket;
  }
}