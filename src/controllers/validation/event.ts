import { check, param } from "express-validator";
import BusinessError, { ValidationErrorCodes } from "../../utilities/errors/business";
import EventStatus from "../../enumerators/event-status";

export const eventCreateRouteValidation = [
  check('name')
    .exists({ checkFalsy: true, checkNull: true })
    .not()
    .isEmpty()
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
    }),
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
    }),
  check('tickets')
    .isInt({ gt: 0 })
    .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT),
  check('limitByParticipant')
    .isBoolean()
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD)
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
    }),
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
    }),
  check('tickets')
    .optional({ checkFalsy: false })
    .isInt({ gt: 0 })
    .withMessage(ValidationErrorCodes.INVALID_TICKET_QNT),
  check('limitByParticipant')
    .optional({ checkFalsy: false })
    .isBoolean()
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
  check('status')
    .optional({ checkFalsy: false })
    .isIn([EventStatus.CANCELLED, EventStatus.CLOSED, EventStatus.FORSALE])
    .withMessage(ValidationErrorCodes.REQUIRED_FIELD),
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