import { TorqueError, TorqueErrorType } from './torque-error'
import { Torque } from './torque'
import { TORQUE_API_URL } from '../package-config'
import {
  CustomerConfig,
  CustomerConfig_ApiResponse,
  customerConfigApiResponseValidationSchema,
} from '../customer/customer-config'
import { ZodError } from 'zod'
import buildAxiosInstance from "../axios/build-axios-instance";
import {buildAuthRequestInterceptor} from "../axios/auth-request-interceptor";


/**
 * @throws {TorqueError}   invalid_config
 * @throws {TorqueError}   api_error
 */
export function initTorque(
  apiPublicKey: string
): Promise<Torque> {
  const url = `${TORQUE_API_URL}/configuration`;
  const TORQUE_PUBLIC_KEY_PREFIX = 'pk_';
  const publicKeyHasValidFormat =
    apiPublicKey.substring(0, TORQUE_PUBLIC_KEY_PREFIX.length)
    === TORQUE_PUBLIC_KEY_PREFIX;

  return new Promise<Torque>(async (resolve, reject) => {
    if(!publicKeyHasValidFormat)
      reject(
        new TorqueError(
          TorqueErrorType.invalid_config,
          'Invalid public key. All public keys start with `pk_`.'
        )
      )

    try {
      const axiosInstance = buildAxiosInstance({
        apiPublicKey
      });
      axiosInstance.interceptors.request.use(
        buildAuthRequestInterceptor()
      )
      const response = await axiosInstance.get(url);
      const customerConfigResponseData: CustomerConfig_ApiResponse = response.data;
      customerConfigApiResponseValidationSchema.parse(customerConfigResponseData)
      const customerConfig: CustomerConfig = {
        customerHandle: customerConfigResponseData.customer_config.customer_handle,
        apiPublicKey
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
            `Torque API server responded with 404 for GET ${url}`
          )
        )
      }
      reject(error)
    }
  });
}

export default initTorque;
