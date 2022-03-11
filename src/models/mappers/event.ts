import EventEntity from "../../db/entities/event";
import { EventDTO } from "../event";

export function eventMapToEntity(event: EventDTO): EventEntity {
  return {
    name: event.name,
    promoter: event.promoter,
    address: event.address,
    tickets: event.tickets,
    date: event.date,
    limitByParticipant: event.limitByParticipant,
  };
}

export function eventMapToDTO(event: EventEntity): EventDTO {
  return {
    id: event.id,
    name: event.name,
    promoter: event.promoter,
    address: event.address,
    tickets: event.tickets,
    date: event.date,
    limitByParticipant: event.limitByParticipant,
  };
}
