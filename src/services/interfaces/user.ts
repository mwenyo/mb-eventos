import { Pagination, ISearchParameterBase } from '../../models/pagination';
import UserEntity from '../../db/entities/user';

export interface IUserService {
  create(user: UserEntity): Promise<UserEntity>;
  createAdmin(newUser: UserEntity, actor: UserEntity): Promise<UserEntity>
  getById(id: string): Promise<UserEntity>;
  getWithPagination(searchParameter: ISearchParameterBase):
    Promise<Pagination<UserEntity>>;
  updateById(user: UserEntity, actor: UserEntity):
    Promise<UserEntity>;
  deleteById(id: string, actor: UserEntity): Promise<boolean>;
}
