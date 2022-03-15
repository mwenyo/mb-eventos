import { injectable } from 'inversify';
import {
  DeleteResult,
  FindManyOptions, FindOneOptions,
  getRepository, ILike, In, Repository, UpdateResult,
} from 'typeorm';

import TicketEntity from '../entities/ticket';

import { ITicketRepository } from './interfaces/ticket';

import { ISearchParameterTicket } from '../../models/pagination';

@injectable()
export class TicketRepository implements ITicketRepository {
  private ticketRepository: Repository<TicketEntity> = getRepository(TicketEntity);
  private fields = [
    'ticket.id',
    'ticket.code',
    'ticket.status',
    'ticket.createdAt',
    'ticket.updatedAt',
    'event.id',
    'event.name',
    'event.address',
    'participant.id',
    'participant.name',
  ];

  async create(tickets: TicketEntity[]): Promise<any> {
    const savedTickets = await this.ticketRepository
      .createQueryBuilder()
      .insert()
      .into('ticket')
      .values(tickets)
      .execute();
    const ids = savedTickets.identifiers.map(id => id.id)
    const [rows, count] = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.participant', 'participant')
      .leftJoinAndSelect('ticket.event', 'event')
      .select(this.fields)
      .where({ id: In(ids) })
      .getManyAndCount();

    return { count, rows };
  }

  async selectPagination(searchParameter: ISearchParameterTicket): Promise<any> {
    let where: any = { deletedAt: null };
    if (searchParameter.event) {
      where = { ...where, event: searchParameter.event };
    }
    if (searchParameter.participant) {
      where = { ...where, participant: searchParameter.participant };
    }
    if (searchParameter.promoter) {
      where = { ...where, event: { promoter: searchParameter.promoter } };
    }
    if (searchParameter.status) {
      where = { ...where, status: searchParameter.status };
    }
    const [rows, count] = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.participant', 'participant')
      .leftJoinAndSelect('ticket.event', 'event')
      .select(this.fields)
      .where(where)
      .skip(searchParameter.offset)
      .take(searchParameter.limit)
      .orderBy('ticket.' + searchParameter.orderBy, searchParameter.isDESC ? 'DESC' : 'ASC')
      .getManyAndCount();

    return {
      count,
      rows
    };
  }

  async selectById(id: string): Promise<TicketEntity> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.participant', 'participant')
      .leftJoinAndSelect('ticket.event', 'event')
      .select(this.fields)
      .where({ id })
      .getOne();
  }

  async selectOneByOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null> {
    return this.ticketRepository.findOne(options);
  }

  async updateById(id: string, ticket: TicketEntity): Promise<any> {
    await this.ticketRepository
      .createQueryBuilder()
      .update()
      .set(ticket)
      .where({ id })
      .execute();
    return this.selectById(id);
  }
}
