export enum TorqueErrorType {
  invalid_config = 'invalid_config',
  api_error = 'api_error',
  unexpected_api_response_data_format = 'unexpected_api_response_data_format'
}

export class TorqueError {
  readonly type: TorqueErrorType;
  readonly message: string;

  constructor(
    type: TorqueErrorType,
    message: string
  ) {
    this.type = type;
    this.message = message;
  }
}
