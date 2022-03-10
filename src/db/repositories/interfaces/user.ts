import UserEntity from '../../entities/user';
import { Pagination, ISearchParameterBase } from '../../../models/pagination';
import { DeleteResult, FindConditions, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';

export interface IUserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  selectById(id: string, options?: FindOneOptions<UserEntity>): Promise<UserEntity | null>;
  updateById(id: string, user: UserEntity): Promise<UpdateResult>;
  selectByIdList(idList: string[]): Promise<UserEntity[] | null>;
  selectByWhere(where: FindManyOptions<UserEntity>): Promise<UserEntity[] | null>;
  selectOneByOptions(options: FindOneOptions<UserEntity>): Promise<UserEntity | null>;
  selectPagination(searchParameter: ISearchParameterBase): Promise<Pagination<UserEntity>>;
  selectAllByOptions(options: FindManyOptions<UserEntity>): Promise<UserEntity[] | null>;
  deleteById(id: string): Promise<DeleteResult>;
}
