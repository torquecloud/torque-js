export enum TorqueErrorType {
  invalid_config = 'invalid_config',
  api_error = 'api_error',
  unexpected_api_response_data_format = 'unexpected_api_response_data_format',
  unknown_error = 'unknown_error'
}

export interface TorqueError {
  readonly type: TorqueErrorType

  /**
   * Human-readable message.
   * */
  readonly message: string

  /**
   * Usually for error of 'unknown_error' type which are not handled by Torque.
   * */
  readonly rawReason?: any
}
