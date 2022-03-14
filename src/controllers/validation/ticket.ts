import { check, param, query } from "express-validator";
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
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  check('status')
    .isIn([TicketStatus.CANCELLED])
    .withMessage(ValidationErrorCodes.INVALID_TICKET_STATUS),
]

export const ticketGetByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]

export const ticketGetWithPaginationRouteValidation = [
  query('participant')
    .optional()
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  query('promoter')
    .optional()
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  query('evet')
    .optional()
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  query('status')
    .isIn([TicketStatus.CANCELLED, TicketStatus.ACTIVE])
    .withMessage(ValidationErrorCodes.INVALID_TICKET_STATUS),
]
