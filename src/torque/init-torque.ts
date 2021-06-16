import { TorqueError, TorqueErrorType } from './torque-error'
import { Torque } from './torque'

const TORQUE_PUBLIC_KEY_PREFIX = 'pk_'


export interface TorqueInitOptions {
  tenantId: string,
  apiPublicKey: string,
}


export function initTorque(
  torqueInitOptions: TorqueInitOptions,
): Promise<{ torque?: Torque, error?: TorqueError }> {
  const {
    tenantId,
    apiPublicKey,
  } = torqueInitOptions

  if (!apiPublicKey)
    return Promise.resolve(
      {
        error: {
          type: TorqueErrorType.invalid_config,
          message: `Torque API public key not defined.`,
        },
      },
    )

  const isProvidedKeyPublicApiKey =
    apiPublicKey.substring(0, TORQUE_PUBLIC_KEY_PREFIX.length)
    === TORQUE_PUBLIC_KEY_PREFIX
  if (!isProvidedKeyPublicApiKey)
    return Promise.resolve(
      {
        error: {
          type: TorqueErrorType.invalid_config,
          message: `Invalid public key. All public keys start with '${TORQUE_PUBLIC_KEY_PREFIX}'.`,
        },
      },
    )

  return Promise.resolve({
    torque: new Torque({
      tenantId,
      apiPublicKey
    }),
  })
}
