import { injectable } from 'inversify';
import {
  DeleteResult,
  FindManyOptions, FindOneOptions,
  getRepository, ILike, Repository, UpdateResult,
} from 'typeorm';

import TicketEntity from '../entities/ticket';

import { ITicketRepository } from './interfaces/ticket';

import { Pagination, ISearchParameterTicket } from '../../models/pagination';
import { ticketMapToDTO } from '../../models/mappers/ticket';
import { userMapToDTO } from '../../models/mappers/user';
import { eventMapToDTO } from '../../models/mappers/event';

@injectable()
export class TicketRepository implements ITicketRepository {
  private ticketRepository: Repository<TicketEntity> = getRepository(TicketEntity);

  async create(tickets: TicketEntity[]): Promise<any> {
    const saved = await this.ticketRepository
      .createQueryBuilder()
      .insert()
      .into('ticket')
      .values(tickets)
      .execute();
    /* const saveMapped = (await this.ticketRepository
      .findByIds(
        saved.identifiers,
        { relations: ['event', 'participant'] }
      ))
      .map(ticket => ticketMapToDTO(ticket)) */
    return saved;
  }

  async selectPagination(searchParameter: ISearchParameterTicket): Promise<any> {//Promise<Pagination<TicketEntity>> {
    let where: any = { deletedAt: null };
    if (searchParameter.event) {
      where = { ...where, event: searchParameter.event };
    }
    if (searchParameter.participant) {
      where = { ...where, participant: { id: searchParameter.participant } };
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
      .select([
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
      ])
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
    return this.ticketRepository.findOne({
      where: {
        id,
      },
      relations: ['event', 'participant', 'event.promoter']
    });
  }

  async selectOneByOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null> {
    return this.ticketRepository.findOne(options);
  }

  async selectAllByOptions(options: FindManyOptions<TicketEntity>):
    Promise<TicketEntity[] | null> {
    return this.ticketRepository.find(options);
  }

  async updateById(id: string, ticket: TicketEntity): Promise<UpdateResult> {
    return this.ticketRepository.update(id, ticket);
  }

  async selectByWhere(where: FindManyOptions<TicketEntity>): Promise<TicketEntity[] | null> {
    return this.ticketRepository.find(where);
  }
}
