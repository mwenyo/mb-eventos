import TicketEntity from "../../db/entities/ticket";
import { TicketDTO } from "../ticket";

export function ticketMapToEntity(ticket: TicketDTO): TicketEntity {
  return {
    participant: ticket.participant,
    event: ticket.event,
    code: ticket.code,
    status: ticket.status
  };
}

export function ticketMapToDTO(ticket: TicketEntity): TicketDTO {
  return {
    id: ticket.id,
    participant: ticket.participant,
    event: ticket.event,
    code: ticket.code,
    status: ticket.status
  };
}
