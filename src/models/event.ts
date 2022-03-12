import UserEntity from "../db/entities/user";

export interface EventDTO {
  id?: string;
  name?: string;
  promoter?: UserEntity;
  address?: string;
  date?: Date;
  tickets?: number;
  limitByParticipant?: boolean;
  status?: number;
}
