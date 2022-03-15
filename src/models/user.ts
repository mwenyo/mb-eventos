import EventEntity from '../db/entities/event';
import UserEntity from '../db/entities/user';


export interface UserDTO {
  id?: string;
  name?: string;
  cpfCnpj?: string;
  address?: string;
  email?: string;
  password?: string;
  profileType?: number;
  events?: EventEntity[];
}

export interface AdditionalInformation {
  actor?: UserEntity;
}