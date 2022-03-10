import { Pagination, ISearchParameterBase } from '../../models/pagination';
import UserEntity from '../../db/entities/user';
import { AdditionalInformation, UserDTO } from '../../models/user';

export interface IUserService {
  create(user: UserEntity, additionalInformation: AdditionalInformation): Promise<UserDTO>;
  getById(id: string): Promise<UserDTO>;
  getWithPagination(searchParameter: ISearchParameterBase):
    Promise<Pagination<UserDTO>>;
  updateById(user: UserEntity, additionalInformation: AdditionalInformation):
    Promise<UserDTO>;
  deleteById(id: string, additionalInformation: AdditionalInformation): Promise<boolean>;
}
