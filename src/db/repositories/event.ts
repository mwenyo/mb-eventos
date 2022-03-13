import { injectable } from 'inversify';
import {
  DeleteResult,
  FindManyOptions, FindOneOptions,
  getRepository, ILike, Repository, UpdateResult,
} from 'typeorm';

import EventEntity from '../entities/event';
import { Pagination, ISearchParameterEvent } from '../../models/pagination';
import { IEventRepository } from './interfaces/event';
import { eventMapToDTO } from '../../models/mappers/event';
import { userMapToDTO } from '../../models/mappers/user';

@injectable()
export class EventRepository implements IEventRepository {
  private eventRepository: Repository<EventEntity> = getRepository(EventEntity);

  async create(event: EventEntity): Promise<EventEntity> {
    return this.eventRepository.save(event);
  }

  // async selectPagination(searchParameter: ISearchParameterEvent, fields: (keyof EventEntity)[]): Promise<Pagination<EventEntity>> {
  async selectPagination(searchParameter: ISearchParameterEvent): Promise<Pagination<EventEntity>> {
    let where: any = { deletedAt: null };
    if (searchParameter.name) {
      where = { ...where, name: ILike(`%${searchParameter.name}%`) };
    }
    if (searchParameter.promoter) {
      where = { ...where, promoter: searchParameter.promoter };
    }
    const [rows, count] = await this.eventRepository.findAndCount({
      where,
      skip: searchParameter.offset,
      take: searchParameter.limit,
      order: {
        [searchParameter.orderBy]: searchParameter.isDESC ? 'DESC' : 'ASC',
      },
      relations: ['promoter'],
    });

    const rowsMapped = rows.map(row => {
      row.promoter = userMapToDTO(row.promoter)
      return eventMapToDTO(row);
    })

    return {
      count,
      rows: rowsMapped,
    };
  }

  async selectById(id: string, options?: FindOneOptions<EventEntity>): Promise<EventEntity> {
    return this.eventRepository.findOne({
      where: {
        id,
        ...options
      },
    })
  }

  async selectByIdList(idList: string[]): Promise<EventEntity[]> {
    return this.eventRepository.findByIds(idList);
  }

  async selectOneByOptions(options: FindOneOptions<EventEntity>): Promise<EventEntity | null> {
    return this.eventRepository.findOne(options);
  }

  async selectAllByOptions(options: FindManyOptions<EventEntity>):
    Promise<EventEntity[] | null> {
    return this.eventRepository.find(options);
  }

  async updateById(id: string, event: EventEntity): Promise<UpdateResult> {
    return this.eventRepository.update(id, event);
  }

  async selectByWhere(where: FindManyOptions<EventEntity>): Promise<EventEntity[] | null> {
    return this.eventRepository.find(where);
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.eventRepository.softDelete({ id });
  }
}
