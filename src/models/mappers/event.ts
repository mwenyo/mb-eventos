import EventEntity from "../../db/entities/event";
import { EventDTO, EventPromoterDTO } from "../event";

export function eventMapToEntity(event: EventDTO): EventEntity {
  return {
    name: event.name,
    promoter: event.promoter,
    address: event.address,
    tickets: event.tickets,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.description,
    limitByParticipant: event.limitByParticipant,
    status: event.status
  };
}

export function eventMapToDTO(event: EventEntity): EventDTO {
  return {
    id: event.id,
    name: event.name,
    promoter: event.promoter,
    address: event.address,
    tickets: event.tickets,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.description,
    limitByParticipant: event.limitByParticipant,
    status: event.status
  };
}

export function eventPromoterMapToDTO(event: EventEntity): EventPromoterDTO {
  return {
    id: event.id,
    name: event.name,
    promoter: event.promoter,
    address: event.address,
    tickets: event.tickets,
    ticketsSold: event.ticketsSold,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.description,
    limitByParticipant: event.limitByParticipant,
    status: event.status
  };
}
