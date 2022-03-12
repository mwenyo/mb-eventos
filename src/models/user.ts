import UserEntity from '../db/entities/user';
import { EventDTO } from './event';

export interface UserDTO {
  id?: string;
  name?: string;
  cpfCnpj?: string;
  address?: string;
  email?: string;
  password?: string;
  profileType?: number;
  events?: EventDTO[];
}

export interface AdditionalInformation {
  actor?: UserEntity;
}