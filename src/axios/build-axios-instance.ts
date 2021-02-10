import axios, { AxiosInstance } from 'axios'
import packageConfig from '../config/package-config'
import { AxiosOptions } from './axios-options'
import { buildAuthRequestInterceptor } from './auth-request-interceptor'


export function buildAxiosInstance(options: AxiosOptions): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: packageConfig.TORQUE_API_URL,
    headers: {
      'Torque-JS-Package-Version': packageConfig.TORQUE_JS_PACKAGE_VERSION,
      'Torque-API-Public-Key': options.apiPublicKey
    },
  })
  return axiosInstance
}

export function buildAxiosInstanceWithAuthInterceptor(options: AxiosOptions): AxiosInstance {
  const axiosInstance = buildAxiosInstance(options);
  const authRequestInterceptor = buildAuthRequestInterceptor()
  axiosInstance.interceptors.request.use(authRequestInterceptor)
  return axiosInstance
}
