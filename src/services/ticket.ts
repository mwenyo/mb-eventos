import { inject, injectable } from 'inversify';

import TYPES from '../utilities/types';
import BusinessError, { ErrorCodes } from '../utilities/errors/business';

import { ITicketService } from './interfaces/ticket';
import { ITicketRepository } from '../db/repositories/interfaces/ticket';
import { IEventRepository } from '../db/repositories/interfaces/event';

import TicketStatus from '../enumerators/ticket-status';
import EventStatus from '../enumerators/event-status';
import ProfileType from '../enumerators/profile-type';

import TicketEntity from '../db/entities/ticket';

import { Pagination, ISearchParameterTicket } from '../models/pagination';
import EventEntity from '../db/entities/event';
import UserEntity from '../db/entities/user';
import { IEventService } from './interfaces/event';

@injectable()
export class TicketService implements ITicketService {
  private ticketRepository: ITicketRepository;
  private eventRepository: IEventRepository;
  private eventService: IEventService;

  constructor(
    @inject(TYPES.TicketRepository) ticketRepository: ITicketRepository,
    @inject(TYPES.EventRepository) eventRepository: IEventRepository,
    @inject(TYPES.EventService) eventService: IEventService,
  ) {
    this.ticketRepository = ticketRepository;
    this.eventRepository = eventRepository;
    this.eventService = eventService;
  }

  async getById(ticketId: string, actor: UserEntity): Promise<TicketEntity> {

    const existTicket = await this.ticketRepository.selectById(ticketId);

    if (!existTicket) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);

    if ((actor.profileType === ProfileType.PARTICIPANT && existTicket.participant.id !== actor.id) ||
      (actor.profileType === ProfileType.PROMOTER && existTicket.event.promoter.id !== actor.id)
    ) {
      throw new BusinessError(ErrorCodes.USER_BLOCKED);
    }

    return existTicket;
  }

  async create(quantity: number, event: string, actor: UserEntity): Promise<TicketEntity[]> {

    const existEvent = await this.eventRepository.selectById(event);
    if (!existEvent) throw new BusinessError(ErrorCodes.ENTITY_NOT_FOUND);
    if (existEvent.status !== EventStatus.FORSALE) throw new BusinessError(ErrorCodes.UNAVALIABLE_EVENT);
    if (existEvent.limitByParticipant) await this.verifyTicketLimit(existEvent, actor);
    const eventSaved = await this.eventService.increaseEventTicketSold(existEvent, quantity);
    const ticketsToSaved = this.createTicketArray(quantity, actor, eventSaved);
    const ticketsSaved = await this.ticketRepository.create(ticketsToSaved);
    return ticketsSaved;
  }

  async getWithPagination(
    searchParameter: ISearchParameterTicket | null, actor: UserEntity
  ): Promise<Pagination<TicketEntity> | null> {
    if (actor.profileType === ProfileType.PARTICIPANT) searchParameter.participant = actor.id;
    if (actor.profileType === ProfileType.PROMOTER) searchParameter.promoter = actor.id;
    const response = await this.ticketRepository.selectPagination(searchParameter);
    return response;
  }

  async updateById(
    ticket: string,
    status: number, actor: UserEntity
  ): Promise<TicketEntity | null> {

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
      await this.eventService.decreaseEventTicketSold(existTicket.event);
    }
    const ticketToUpdate = {
      status,
      updatedBy: (actor && actor.id) || 'SYSTEM',
    };
    await this.ticketRepository.updateById(ticket, ticketToUpdate);
    const response = await this.ticketRepository.selectById(ticket);
    return response;
  }

  private async verifyTicketLimit(event: EventEntity, actor: UserEntity) {
    const existTicket = await this.ticketRepository.selectOneByOptions({
      where: {
        event: event.id,
        participant: actor.id,
        status: TicketStatus.ACTIVE
      }
    });
    if (existTicket) throw new BusinessError(ErrorCodes.TICKET_LIMIT_REACHED);
  }

  private createTicketArray(quantity: number, actor: UserEntity, event: EventEntity): TicketEntity[] {
    const ticketArray: TicketEntity[] = [];
    for (let i = 0; i < quantity; i++) {
      const code = Math.floor(Date.now() * Math.random()).toString(36).toUpperCase();
      const ticketToSave = {
        participant: actor,
        event: event,
        code,
        status: TicketStatus.ACTIVE,
        createdBy: (actor && actor.id) || 'SYSTEM',
        updatedBy: (actor && actor.id) || 'SYSTEM',
      };
      ticketArray.push(ticketToSave);
    }
    return ticketArray;
  }
}