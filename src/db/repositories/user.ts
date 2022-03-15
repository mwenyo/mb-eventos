import { injectable } from 'inversify';
import {
  DeleteResult,
  FindConditions, FindManyOptions, FindOneOptions,
  getRepository, ILike, Repository, UpdateResult,
} from 'typeorm';

import UserEntity from '../entities/user';
import { Pagination, ISearchParameterUser } from '../../models/pagination';
import { IUserRepository } from './interfaces/user';

@injectable()
export class UserRepository implements IUserRepository {
  private userRepository: Repository<UserEntity> = getRepository(UserEntity);
  private fields = [
    'id',
    'name',
    'email',
    'cpfCpnj',
    'address',
    'profileType',
  ]

  async create(user: UserEntity): Promise<UserEntity> {
    const x = await this.userRepository.createQueryBuilder()
      .insert()
      .into('user')
      .values(user)
      .execute();
    return this.selectById(user.id);
  }

  async selectPagination(searchParameter: ISearchParameterUser): Promise<Pagination<UserEntity>> {
    let where: any = { deletedAt: null };
    if (searchParameter.name) {
      where = { ...where, name: ILike(`%${searchParameter.name}%`) };
    }
    if (searchParameter.email) {
      where = { ...where, email: ILike(`%${searchParameter.email}%`) };
    }
    if (searchParameter.profileType) {
      const newWhere = [];
      newWhere.push(
        ...searchParameter.profileType.map(num => ({
          ...where,
          profileType: Number(num),
        })),
      );
      where = newWhere;
    }
    const [rows, count] = await this.userRepository
      .createQueryBuilder('user')
      .select(this.fields)
      .where(where)
      .skip(searchParameter.offset)
      .take(searchParameter.limit)
      .orderBy(searchParameter.orderBy, searchParameter.isDESC ? 'DESC' : 'ASC')
      .getManyAndCount();

    return {
      count,
      rows,
    };
  }

  async selectById(id: string): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('user')
      .select(this.fields)
      .where({ id })
      .getOne();
  }

  async updateById(id: string, user: UserEntity): Promise<UpdateResult> {
    return this.userRepository.update(id, user);
  }

  async selectByWhere(where: FindManyOptions<UserEntity>): Promise<UserEntity[] | null> {
    return this.userRepository.find(where);
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.userRepository.softDelete({ id });
  }
}
