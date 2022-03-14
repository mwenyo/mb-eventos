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

  async create(tickets: TicketEntity[]): Promise<TicketEntity[]> {
    const saved = await this.ticketRepository
      .createQueryBuilder()
      .insert()
      .into('ticket')
      .values(tickets)
      .execute();
    const saveMapped = (await this.ticketRepository
      .findByIds(
        saved.identifiers,
        { relations: ['event', 'participant'] }
      ))
      .map(ticket => ticketMapToDTO(ticket))
    return saveMapped;
  }

  // async selectPagination(searchParameter: ISearchParameterTicket, fields: (keyof TicketEntity)[]): Promise<Pagination<TicketEntity>> {
  async selectPagination(searchParameter: ISearchParameterTicket): Promise<Pagination<TicketEntity>> {
    let where: any = { deletedAt: null };
    if (searchParameter.event) {
      where = { ...where, event: ILike(`%${searchParameter.event}%`) };
    }
    if (searchParameter.participant) {
      where = { ...where, participant: searchParameter.participant };
    }
    const [rows, count] = await this.ticketRepository.findAndCount({
      where,
      skip: searchParameter.offset,
      take: searchParameter.limit,
      order: {
        [searchParameter.orderBy]: searchParameter.isDESC ? 'DESC' : 'ASC',
      },
      relations: ['participant', 'event'],
    });

    const rowsMapped = rows.map(row => {
      row.participant = userMapToDTO(row.participant)
      row.event = eventMapToDTO(row.event)
      return ticketMapToDTO(row);
    })

    return {
      count,
      rows: rowsMapped,
    };
  }

  async selectById(id: string, options?: FindOneOptions<TicketEntity>): Promise<TicketEntity> {
    return this.ticketRepository.findOne({
      where: {
        id,
        ...options
      },
    })
  }

  async selectByIdList(idList: string[]): Promise<TicketEntity[]> {
    return this.ticketRepository.findByIds(idList);
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

  async deleteById(id: string): Promise<DeleteResult> {
    return this.ticketRepository.softDelete({ id });
  }
}
