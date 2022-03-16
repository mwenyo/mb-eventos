import { injectable } from 'inversify';
import {
  DeleteResult,
  FindManyOptions, FindOneOptions,
  getRepository, ILike, Repository,
} from 'typeorm';

import EventEntity from '../entities/event';
import { IEventRepository } from './interfaces/event';
import { Pagination, ISearchParameterEvent } from '../../models/pagination';
import EventStatus from '../../enumerators/event-status';
import BusinessError, { ErrorCodes } from '../../utilities/errors/business';

@injectable()
export class EventRepository implements IEventRepository {
  private eventRepository: Repository<EventEntity> = getRepository(EventEntity);
  private fields = [
    'event.id',
    'event.name',
    'event.startDate',
    'event.endDate',
    'event.address',
    'event.description',
    'event.tickets',
    'event.ticketPrice',
    'event.ticketsSold',
    'event.limitByParticipant',
    'event.status',
    'event.createdAt',
    'event.updatedAt',
    'event.deletedAt',
    'promoter.id',
    'promoter.name',
    'promoter.cpfCnpj',
  ]

  async create(event: EventEntity): Promise<EventEntity> {
    const x = await this.eventRepository.createQueryBuilder()
      .insert()
      .into('event')
      .values(event)
      .execute();
    return this.selectById(event.id);
  }

  async selectPagination(searchParameter: ISearchParameterEvent, samePromoter: boolean): Promise<Pagination<EventEntity>> {
    let where: any = { deletedAt: null };
    if (searchParameter.name) {
      where = { ...where, name: ILike(`%${searchParameter.name}%`) };
    }
    if (searchParameter.promoter) {
      where = { ...where, promoter: searchParameter.promoter };
    }
    if (!samePromoter) this.fields.splice(this.fields.indexOf('event.ticketsSold'), 1);
    const [rows, count] = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.promoter', 'promoter')
      .select(this.fields)
      .where(where)
      .skip(searchParameter.offset)
      .take(searchParameter.limit)
      .orderBy('event.' + searchParameter.orderBy, searchParameter.isDESC ? 'DESC' : 'ASC')
      .getManyAndCount();

    return {
      count,
      rows,
    };
  }

  async selectById(id: string, options?: FindOneOptions<EventEntity>): Promise<EventEntity> {
    return await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.promoter', 'promoter')
      .select(this.fields)
      .where({ id })
      .getOne();
  }

  async updateById(id: string, event: EventEntity): Promise<EventEntity> {
    await this.eventRepository
      .createQueryBuilder()
      .update()
      .set(event)
      .where({ id })
      .execute();
    return this.selectById(id);
  }

  async selectByWhere(where: FindManyOptions<EventEntity>): Promise<EventEntity[] | null> {
    return this.eventRepository.find(where);
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.eventRepository.softDelete({ id });
  }
}
