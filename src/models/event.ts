import UserEntity from "../db/entities/user";

export interface EventDTO {
  id?: string;
  name?: string;
  promoter?: UserEntity;
  address?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  tickets?: number;
  ticketPrice?: number;
  limitByParticipant?: boolean;
  status?: number;
}
