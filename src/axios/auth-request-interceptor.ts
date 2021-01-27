import { AxiosRequestConfig } from 'axios'
import { AuthContextStorage } from '../torque-user/auth-context-storage'


export function makeAuthHeader(authToken: string) {
  return {
    name: 'Authorization',
    value: `Bearer ${authToken}`,
  }
}

export function buildAuthRequestInterceptor() {
  return function mainAxiosRequestInterceptor(
    request: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const authContext = AuthContextStorage.load()
    if (authContext) {
      const authHeader = makeAuthHeader(authContext.authToken)
      request.headers[authHeader.name] = authHeader.value
    }
    return request
  }
}
