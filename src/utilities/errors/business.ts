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
  PROFILE_NOT_ALLOWED = 'Perfil não permitido',
}
