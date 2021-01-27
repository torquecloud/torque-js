import { TorqueError, TorqueErrorType } from './torque-error'
import { Torque } from './torque'
import packageConfig from '../config/package-config'
import {
  CustomerConfig
} from '../customer/customer-config'
import { ZodError } from 'zod'
import buildAxiosInstance from "../axios/build-axios-instance";
import {buildAuthRequestInterceptor} from "../axios/auth-request-interceptor";
import {
  CustomerConfigFromTorqueCustomerApi,
  CustomerConfigFromTorqueCustomerApi_ApiResponseData,
  customerConfigFromTorqueCustomerApi_responseValidationSchema,
} from '../customer/customer-config-from-torque-customer-api'


const TORQUE_PUBLIC_KEY_PREFIX = 'pk_';
const CUSTOMER_CONFIGURATION_TORQUE_API_URL = `${packageConfig.TORQUE_API_URL}/configuration`;


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
  torqueInitOptions: TorqueInitOptions
): Promise<Torque> {
  const {
    apiPublicKey,
    fallbackUrl,
    authCallbackUrl
  } = torqueInitOptions

  if(!apiPublicKey)
    return Promise.reject(
      new TorqueError(
        TorqueErrorType.invalid_config,
        `Torque API public key not defined.`
      )
    )

  if(!fallbackUrl)
    return Promise.reject(
      new TorqueError(
        TorqueErrorType.invalid_config,
        `'fallbackUrl' is not defined.`
      )
    )

  if(!authCallbackUrl)
    return Promise.reject(
      new TorqueError(
        TorqueErrorType.invalid_config,
        `'authCallbackUrl' is not defined.`
      )
    )

  const isProvidedKeyPublicApiKey =
    apiPublicKey.substring(0, TORQUE_PUBLIC_KEY_PREFIX.length)
    === TORQUE_PUBLIC_KEY_PREFIX;
  if(!isProvidedKeyPublicApiKey)
    return Promise.reject(
      new TorqueError(
        TorqueErrorType.invalid_config,
        `Invalid public key. All public keys start with '${TORQUE_PUBLIC_KEY_PREFIX}'.`
      )
    )

  return new Promise<Torque>(async (resolve, reject) => {
    try {
      const axiosInstance = buildAxiosInstance({
        apiPublicKey
      });
      axiosInstance.interceptors.request.use(
        buildAuthRequestInterceptor()
      )
      const response = await axiosInstance.get(CUSTOMER_CONFIGURATION_TORQUE_API_URL);
      const customerConfigResponseData: CustomerConfigFromTorqueCustomerApi_ApiResponseData = response.data;
      customerConfigFromTorqueCustomerApi_responseValidationSchema.parse(customerConfigResponseData)
      const customerConfigFromTorqueCustomerApi: CustomerConfigFromTorqueCustomerApi = {
        customerHandle: customerConfigResponseData.customer_config.customer_handle,
      }

      const customerConfig: CustomerConfig = {
        apiPublicKey,
        customerHandle: customerConfigFromTorqueCustomerApi.customerHandle,
        fallbackUrl: fallbackUrl,
        authCallbackUrl: authCallbackUrl
      }

      resolve(new Torque(customerConfig));
    } catch (error){
      if(error instanceof ZodError){
        reject(
          new TorqueError(
            TorqueErrorType.unexpected_api_response_data_format,
            error.toString()
          )
        )
      }
      if(error.response && error.response.status === 404){
        reject(
          new TorqueError(
            TorqueErrorType.api_error,
            `Torque API server responded with HTTP status 404 for HTTP GET ${CUSTOMER_CONFIGURATION_TORQUE_API_URL}`
          )
        )
      }
      reject(error)
    }
  });
}

export default initTorque;
