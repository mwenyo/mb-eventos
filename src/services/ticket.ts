import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes, ValidationErrorCodes } from '../utilities/errors/business';
import { ILike } from 'typeorm';

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

  async getById(ticketId: string): Promise<TicketDTO> {
    const ticket = await this.ticketRepository.selectById(ticketId);
    if (!ticket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)
    return ticket;
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
    }
    await this.eventRepository.updateById(event, eventToUpdate);
    const eventSaved = await this.eventRepository.selectById(event)
    const ticketsToSaved: TicketEntity[] = [];
    for (let i = 0; i < quantity; i++) {
      const code = Math.floor(Date.now() * Math.random()).toString(36).toUpperCase()
      const ticketToSave = {
        participant: actor,
        event: eventSaved,
        code,
        status: TicketStatus.ACTIVE,
        createdBy: (actor && actor.id) || 'SYSTEM',
        updatedBy: (actor && actor.id) || 'SYSTEM',
      };
      ticketsToSaved.push(ticketToSave)
    }
    const ticketsSaved = await this.ticketRepository.create(ticketsToSaved);
    ticketsSaved.map(ticket => {
      ticket.participant = userMapToDTO(ticket.participant)
      ticket.event = eventMapToDTO(ticket.event)
      return ticket
    });
    return ticketsSaved;
  }

  async getWithPagination(searchParameter: ISearchParameterTicket | null, samePromoter: boolean):
    Promise<Pagination<TicketDTO> | null> {
    /* const response = await this.ticketRepository.selectPagination(searchParameter);
    if (samePromoter) {
      response.rows = response.rows.map(row => {
        delete (row.promoter);
        return row;
      });
    }
    return response; */
    throw Error('Not implemented yet!')
  }

  async updateById(ticket: TicketEntity, additionalInformation: AdditionalInformation): Promise<TicketDTO | null> {
    /* const { actor } = additionalInformation;

    const existTicket = await this.ticketRepository.selectById(ticket.id)

    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)

    const existTickets = await this.ticketRepository.selectByWhere({
      where: {
        name: ILike(`${ticket.name}`),
        status: TicketStatus.FORSALE
      }
    })

    if (existTickets.length !== 0) throw new BusinessError(ErrorCodes.EVENT_ALREADY_EXISTS)

    if (existTicket.ticketsSold > ticket.tickets) throw new BusinessError(ValidationErrorCodes.INVALID_TICKET_QNT)

    const ticketToUpdate = {
      ...ticket.name && { ticket: ticket.name },
      ...ticket.address && { ticket: ticket.address },
      ...ticket.description && { ticket: ticket.description },
      ...ticket.startDate && { ticket: ticket.startDate },
      ...ticket.endDate && { ticket: ticket.endDate },
      ...ticket.tickets && { ticket: ticket.tickets },
      ...ticket.ticketPrice && { ticket: ticket.ticketPrice },
      ...ticket.limitByParticipant && { ticket: ticket.limitByParticipant },
      ...ticket.status && { ticket: ticket.status },
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };

    await this.ticketRepository.updateById(ticket.id, ticketToUpdate)
    const response = await this.getById(ticket.id);
    response.promoter = userMapToDTO(response.promoter)
    return ticketMapToDTO(response); */
    throw Error('Not implemented yet!')
  }

  async deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean> {
    /* const { actor } = additionalInformation
    const ticket = await this.getById(id);

    if (!ticket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND)

    const ticketToSave = {
      deletedBy: (actor && actor.id) || 'SYSTEM',
      deletedAt: new Date(),
    };

    await this.ticketRepository.updateById(id, ticketToSave)

    await this.ticketRepository.deleteById(id);
    return true; */
    throw Error('Not implemented yet!')
  }
}