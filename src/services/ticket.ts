import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes } from '../utilities/errors/business';

import TicketEntity from '../db/entities/ticket';
import { ITicketRepository } from '../db/repositories/interfaces/ticket';
import { ITicketService } from './interfaces/ticket';
import { TicketDTO } from '../models/ticket';

import { Pagination, ISearchParameterTicket } from '../models/pagination';
import { AdditionalInformation } from '../models/user';
import { ticketMapToDTO } from '../models/mappers/ticket';
import TicketStatus from '../enumerators/ticket-status';
import { userMapToDTO } from '../models/mappers/user';
import { IEventRepository } from '../db/repositories/interfaces/event';
import EventStatus from '../enumerators/event-status';
import { eventMapToDTO } from '../models/mappers/event';
import ProfileType from '../enumerators/profile-type';

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
    const existTicket = ticketMapToDTO(await this.ticketRepository.selectById(ticketId));

    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);

    if ((actor.profileType === ProfileType.PARTICIPANT && existTicket.participant.id !== actor.id) ||
      (actor.profileType === ProfileType.PROMOTER && existTicket.event.promoter.id !== actor.id)
    ) {
      throw new BusinessError(ErrorCodes.USER_BLOCKED);
    }

    existTicket.event = eventMapToDTO(existTicket.event);
    existTicket.event.promoter = userMapToDTO(existTicket.event.promoter);
    existTicket.participant = userMapToDTO(existTicket.participant);

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
          status: TicketStatus.ACTIVE
        }
      });
      if (existTicket) throw new BusinessError(ErrorCodes.TICKET_LIMIT_REACHED);
    }
    const updatedTicketSold = existEvent.ticketsSold + quantity;
    const ticketLimitReached = updatedTicketSold > existEvent.tickets;
    if (ticketLimitReached) throw new BusinessError(ErrorCodes.TICKET_LIMIT_REACHED);
    const lastTicketSold = updatedTicketSold === existEvent.tickets;
    const eventToUpdate = {
      ticketsSold: updatedTicketSold,
      ...lastTicketSold && { status: EventStatus.CLOSED },
      updatedBy: 'SYSTEM',
    };
    await this.eventRepository.updateById(event, eventToUpdate);
    const eventSaved = await this.eventRepository.selectById(event);
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
    ticketsSaved.map(ticket => {
      ticket.participant = userMapToDTO(ticket.participant);
      ticket.event = eventMapToDTO(ticket.event);
      return ticket;
    });
    return ticketsSaved;
  }

  async getWithPagination(searchParameter: ISearchParameterTicket | null, additionalInformation: AdditionalInformation):
    Promise<Pagination<TicketDTO> | null> {
    const { actor } = additionalInformation;
    if (actor.profileType === ProfileType.PARTICIPANT) searchParameter.participant = actor.id;
    if (actor.profileType === ProfileType.PROMOTER) searchParameter.promoter = actor.id;
    const response = await this.ticketRepository.selectPagination(searchParameter);
    return response;
  }

  async updateById(ticket: string, status: number, additionalInformation: AdditionalInformation): Promise<TicketDTO | null> {
    const { actor } = additionalInformation;
    const existTicket = await this.ticketRepository.selectOneByOptions({
      where: {
        status: TicketStatus.ACTIVE
      },
      relations: ['event', 'participant', 'event.promoter']
    });

    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);

    if (existTicket.event.status !== EventStatus.FORSALE) throw new BusinessError(ErrorCodes.UNAVALIABLE_EVENT);

    if (((actor.profileType === ProfileType.PARTICIPANT) &&
      (status !== TicketStatus.CANCELLED || existTicket.participant.id !== actor.id)) ||
      (actor.profileType === ProfileType.PROMOTER && existTicket.event.promoter.id !== actor.id) ||
      (existTicket.status === status)
    ) {
      throw new BusinessError(ErrorCodes.USER_BLOCKED);
    }

    if (status === TicketStatus.CANCELLED) {
      const updatedTicketSold = existTicket.event.ticketsSold - 1
      const eventToUpdate = {
        ticketsSold: updatedTicketSold,
        updatedBy: 'SYSTEM',
      };
      await this.eventRepository.updateById(existTicket.event.id, eventToUpdate);
      const eventSaved = await this.eventRepository.selectById(existTicket.event.id);
      existTicket.event = eventSaved;
    }

    const ticketToUpdate = {
      status,
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };
    await this.ticketRepository.updateById(ticket, ticketToUpdate);
    const response = await this.ticketRepository.selectById(ticket);
    response.participant = userMapToDTO(response.participant);
    response.event = eventMapToDTO(response.event);
    response.event.promoter = eventMapToDTO(response.event.promoter);
    return ticketMapToDTO(response);
  }
}