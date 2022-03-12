import { CustomError } from 'ts-custom-error';

export default class BusinessError extends CustomError {
  code: string;
  options: { [key: string]: string | number | boolean } | string;
  isBusinessError: boolean = true;

  constructor(code: string, options?: { [key: string]: string | number | boolean } | string) {
    super(code);
    this.code = code;
    this.options = options;
  }
}

export enum TemplateErrorCodes {
  TEMPLATE_NOT_FOUND = 'template_not_found',
}

export enum ErrorCodes {
  USER_BLOCKED = 'Usuário bloqueado na plataforma',
  USER_NOT_FOUND = 'Usuário não encontrado',
  INVALID_CREDENTIALS = 'Email/senha inválidos',
  ENTITY_NOT_FOUND = 'Entidade não encontrada',
  USER_ALREADY_EXISTS = 'Usuário já existente',
  EVENT_ALREADY_EXISTS = 'Já existe um evento em aberto com mesmo nome',
  PROFILE_NOT_ALLOWED = 'Perfil não permitido',
}

export enum ValidationErrorCodes {
  REQUIRED_FIELD = 'Campo obrigatório',
  PASSWORD_MIN_LENGTH = 'A senha deve conter no mínimo 8 caracteres',
  PASSWORD_CONFIRMATION_MIN_LENGTH = 'A confirmação da senha deve conter no mínimo 8 caracteres',
  INVALID_UUID = 'UUID Inválido',
  INVALID_TOKEN = 'Token inválido',
  INVALID_PROFILE_TYPE = 'Perfil de usuário inválido',
  INVALID_EMAIL = 'Formato de email inválido',
  PASSWORDS_DONT_MATCH = 'Senha e confirmação de senha não conferem',
  INVALID_CPF = 'Formato inválido para CPF',
  INVALID_CNPJ = 'Formato inválido para CNPJ',
  INVALID_CPF_OR_CNPJ = 'Formato inválido para CPF ou CNPJ',
  INVALID_DATETIME = 'Data/Hora em formato incorreto',
  INVALID_TICKET_QNT = 'Quantidade de ingressos deve ser maior do que 0'
}