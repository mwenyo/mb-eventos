import { Pagination, ISearchParameterBase } from '../../models/pagination';
import UserEntity from '../../db/entities/user';
import { UserDTO } from '../../models/user';

export interface IUserService {
  create(user: UserEntity): Promise<UserDTO>;
  getById(id: string): Promise<UserDTO>;
  getWithPagination(searchParameter: ISearchParameterBase):
    Promise<Pagination<UserDTO>>;
  updateById(user: UserEntity, actor: UserEntity):
    Promise<UserDTO>;
  deleteById(id: string, actor: UserEntity): Promise<boolean>;
}
