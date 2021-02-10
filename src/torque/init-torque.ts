import { TorqueError, TorqueErrorType } from './torque-error'
import { Torque } from './torque'
import packageConfig from '../config/package-config'
import { CustomerConfig } from '../customer/customer-config'
import { ZodError } from 'zod'
import { buildAxiosInstanceWithAuthInterceptor } from '../axios/build-axios-instance'
import {
  CustomerConfigFromTorqueCustomerApi,
  CustomerConfigFromTorqueCustomerApi_ApiResponseData,
  customerConfigFromTorqueCustomerApi_responseValidationSchema,
} from '../customer/customer-config-from-torque-customer-api'


const TORQUE_PUBLIC_KEY_PREFIX = 'pk_'
const CUSTOMER_CONFIGURATION_TORQUE_API_URL = `${packageConfig.TORQUE_API_URL}/configuration`


export interface TorqueInitOptions {
  apiPublicKey: string,
  authCallbackUrl: string,
  fallbackUrl: string
}


/**
 * Validates provided initializationOptions, gets your configuration from Torque API,
 * and creates new Torque instance.
 *
 * @throws {TorqueError}   invalid_config
 * @throws {TorqueError}   api_error
 */
export function initTorque(
  torqueInitOptions: TorqueInitOptions,
): Promise<{ torque?: Torque, error?: TorqueError }> {
  const {
    apiPublicKey,
    fallbackUrl,
    authCallbackUrl,
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

  if (!fallbackUrl)
    return Promise.resolve(
      {
        error: {
          type: TorqueErrorType.invalid_config,
          message: `'fallbackUrl' is not defined.`,
        },
      },
    )

  if (!authCallbackUrl)
    return Promise.resolve(
      {
        error: {
          type: TorqueErrorType.invalid_config,
          message: `'authCallbackUrl' is not defined.`,
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

  const axiosInstance = buildAxiosInstanceWithAuthInterceptor({
    apiPublicKey,
  })

  return axiosInstance.get(CUSTOMER_CONFIGURATION_TORQUE_API_URL)
    .then(response => {
      const customerConfigResponseData: CustomerConfigFromTorqueCustomerApi_ApiResponseData = response.data
      customerConfigFromTorqueCustomerApi_responseValidationSchema.parse(customerConfigResponseData)
      const customerConfigFromTorqueCustomerApi: CustomerConfigFromTorqueCustomerApi = {
        customerHandle: customerConfigResponseData.customer_config.customer_handle,
      }

      const customerConfig: CustomerConfig = {
        apiPublicKey,
        customerHandle: customerConfigFromTorqueCustomerApi.customerHandle,
        fallbackUrl: fallbackUrl,
        authCallbackUrl: authCallbackUrl,
      }

      return {
        torque: new Torque(customerConfig),
      }
    }).catch(reason => {
      if (reason.response) {
        const axiosError = reason
        return {
          error: {
            type: TorqueErrorType.api_error,
            message: `Torque API server responded with HTTP status ${axiosError.response.status} for HTTP GET ${CUSTOMER_CONFIGURATION_TORQUE_API_URL}`,
            rawReason: axiosError,
          },
        }
      }
      if (reason instanceof ZodError) {
        return {
          error: {
            type: TorqueErrorType.unexpected_api_response_data_format,
            message: reason.toString(),
            rawReason: reason,
          },
        }
      }
      return {
        error: {
          type: TorqueErrorType.unknown_error,
          message: `Unknown error happened while initializing Torque.`,
          rawReason: reason,
        },
      }
    })
}

export default initTorque
