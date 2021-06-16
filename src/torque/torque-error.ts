export enum TorqueErrorType {
  invalid_config = 'invalid_config',
  invalid_parameter = 'invalid_parameter',
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
