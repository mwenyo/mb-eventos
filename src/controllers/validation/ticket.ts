import { check, param } from "express-validator";
import BusinessError, { ValidationErrorCodes } from "../../utilities/errors/business";
import TicketStatus from "../../enumerators/ticket-status";

export const ticketCreateRouteValidation = [
  check('event')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  check('quantity')
    .isInt({ gt: 0 })
    .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT),
]

export const ticketUpdateByIdRouteValidation = [

]

export const ticketGetByIdRouteValidation = [

]

export const ticketGetWithPaginationRouteValidation = [

]

export const ticketDeleteByIdRouteValidation = [

]
