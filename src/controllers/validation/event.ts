import { check, param } from "express-validator";
import BusinessError, { ValidationErrorCodes } from "../../utilities/errors/business";
import EventStatus from "../../enumerators/event-status";

export const eventCreateRouteValidation = [
  check('name')
    .exists({ checkFalsy: true, checkNull: true })
    .not()
    .isEmpty()
    .trim()
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
  check('address')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
  check('startDate')
    .isISO8601()
    .withMessage(ValidationErrorCodes.INVALID_DATETIME)
    .custom(value => {
      const startDate = new Date(value);
      const todaysDate = new Date();
      if (startDate <= todaysDate) {
        throw new BusinessError(ValidationErrorCodes.DATE_IN_PAST);
      }
      return true;
    })
    .toDate(),
  check('endDate')
    .isISO8601()
    .withMessage(ValidationErrorCodes.INVALID_DATETIME)
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (startDate >= endDate) {
        throw new BusinessError(ValidationErrorCodes.END_DATE_GT_START_DATE);
      }
      return true;
    })
    .toDate(),
  check('tickets')
    .isInt({ gt: 0 })
    .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT)
    .toInt(),
  check('ticketPrice')
    .isNumeric()
    .withMessage(ValidationErrorCodes.INVALID_TICKET_PRICE)
    .toFloat(),
  check('limitByParticipant')
    .isBoolean()
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD)
    .toBoolean()
]

export const eventUpdateByIdRouteValidation = [
  check('startDate')
    .optional({ checkFalsy: false })
    .isISO8601()
    .withMessage(ValidationErrorCodes.INVALID_DATETIME)
    .custom(value => {
      const startDate = new Date(value);
      const todaysDate = new Date();
      if (startDate <= todaysDate) {
        throw new BusinessError(ValidationErrorCodes.DATE_IN_PAST);
      }
      return true;
    })
    .toDate(),
  check('endDate')
    .optional({ checkFalsy: false })
    .isISO8601()
    .withMessage(ValidationErrorCodes.INVALID_DATETIME)
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (startDate >= endDate) {
        throw new BusinessError(ValidationErrorCodes.END_DATE_GT_START_DATE);
      }
      return true;
    })
    .toDate(),
  check('tickets')
    .optional({ checkFalsy: false })
    .isInt({ gt: 0 })
    .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT)
    .toInt(),
  check('ticketPrice')
    .optional({ checkFalsy: false })
    .isNumeric()
    .withMessage(ValidationErrorCodes.INVALID_TICKET_PRICE)
    .toFloat(),
  check('limitByParticipant')
    .optional({ checkFalsy: false })
    .isBoolean()
    .withMessage(ValidationErrorCodes.INVALID_BOOLEAN)
    .toBoolean(),
  check('status')
    .optional({ checkFalsy: false })
    .isIn([EventStatus.CANCELLED, EventStatus.CLOSED, EventStatus.FORSALE])
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD)
    .toInt(),
]

export const eventGetByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]

export const eventGetWithPaginationRouteValidation = [
  param('promoter')
    .optional({ checkFalsy: false })
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]

export const eventDeleteByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]