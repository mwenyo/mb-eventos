import { CustomError } from 'ts-custom-error';

export default class ForbiddenError extends CustomError {
  isForbiddenError: boolean = true;

  constructor() {
    super();
  }
}
