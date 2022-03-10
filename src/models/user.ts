import UserEntity from '../db/entities/user';

export interface UserDTO {
  id?: string;
  name?: string;
  cpfCnpj?: string;
  adress?: string;
  email?: string;
  password?: string;
  profileType?: number;
}

export interface AdditionalInformation {
  actor?: UserEntity;
  token?: string;
}