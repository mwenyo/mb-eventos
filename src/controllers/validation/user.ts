import { check, param } from "express-validator";
import { cnpj, cpf } from "cpf-cnpj-validator";
import ProfileType from "../../enumerators/profile-type";
import BusinessError, { ValidationErrorCodes } from "../../utilities/errors/business";

export const userCreateRouteValidation = [
  check('name').exists({ checkFalsy: true, checkNull: true }).withMessage(ValidationErrorCodes.REQUIRED_FIELD)
  ,
  check('email')
    .isEmail()
    .withMessage(ValidationErrorCodes.INVALID_EMAIL),
  check('profileType')
    .isIn([
      ProfileType.PARTICIPANT,
      ProfileType.PROMOTER
    ])
    .withMessage(ValidationErrorCodes.INVALID_PROFILE_TYPE),
  check('password')
    .isLength({ min: 8 })
    .withMessage(ValidationErrorCodes.PASSWORD_MIN_LENGTH),
  check('passwordConfirmation')
    .isLength({ min: 8 })
    .withMessage(ValidationErrorCodes.PASSWORD_CONFIRMATION_MIN_LENGTH)
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new BusinessError(ValidationErrorCodes.PASSWORDS_DONT_MATCH);
      }
      return true;
    }),
  check('cpfCnpj').custom((value, { req }) => {
    if ((parseInt(req.body.profileType) === ProfileType.PARTICIPANT) && (!cpf.isValid(value))) {
      throw new BusinessError(ValidationErrorCodes.INVALID_CPF);
    }

    if ((parseInt(req.body.profileType) === ProfileType.PROMOTER) && (!cnpj.isValid(value))) {
      throw new BusinessError(ValidationErrorCodes.INVALID_CNPJ);
    }
    return true;
  })
]

export const userGetByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]

export const userGetWithPaginationRouteValidation = [
  param('email')
    .optional({ checkFalsy: false })
    .isEmail()
    .withMessage(ValidationErrorCodes.INVALID_EMAIL),
  param('profileType')
    .optional({ checkFalsy: false })
    .isIn([
      ProfileType.ADMIN,
      ProfileType.PARTICIPANT,
      ProfileType.PROMOTER
    ])
]

export const userUpdateByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID),
  check('name')
    .optional({ checkFalsy: false }),
  check('email')
    .optional({ checkFalsy: false })
    .isEmail()
    .withMessage(ValidationErrorCodes.INVALID_EMAIL),
  check('cpfCnpj')
    .optional({ checkFalsy: false })
    .custom((value, { req }) => {
      if ((!cnpj.isValid(value)) && (!cpf.isValid(value))) {
        throw new BusinessError(ValidationErrorCodes.INVALID_CPF_OR_CNPJ);
      }
      return true;
    }),
]

export const userDeleteByIdRouteValidation = [
  param('id')
    .isUUID()
    .withMessage(ValidationErrorCodes.INVALID_UUID)
]