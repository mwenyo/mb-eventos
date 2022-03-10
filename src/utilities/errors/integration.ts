import { CustomError } from 'ts-custom-error';

export default class IntegrationError extends CustomError {
  service: string;
  isIntegrationError: boolean = true;

  constructor(service: string, err) {
    super(err);
    this.service = service;
  }
}
