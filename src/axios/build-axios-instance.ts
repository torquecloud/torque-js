import axios, { AxiosInstance } from 'axios'
import { TORQUE_API_URL, TORQUE_JS_PACKAGE_VERSION } from '../package-config'
import { AxiosOptions } from './axios-options'
import { buildAuthRequestInterceptor } from './auth-request-interceptor'


export function buildAxiosInstance(options: AxiosOptions): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: TORQUE_API_URL,
    headers: {
      'Torque-JS-Package-Version': TORQUE_JS_PACKAGE_VERSION,
      'Torque-API-Public-Key': options.apiPublicKey
    },
  })
  const authRequestInterceptor = buildAuthRequestInterceptor()
  axiosInstance.interceptors.request.use(authRequestInterceptor)
  return axiosInstance
}

export default buildAxiosInstance
