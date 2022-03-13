import EventEntity from "../db/entities/event";
import UserEntity from "../db/entities/user";

export interface TicketDTO {
  id?: string;
  participant?: UserEntity;
  event?: EventEntity;
  code?: string;
  status?: number;
}
