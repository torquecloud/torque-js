import { CustomerConfig } from '../customer/customer-config'
import { TORQUE_API_URL, TORQUE_USER_FLOWS_WEBAPP_URL } from '../package-config'
import {
  AuthenticatedTorqueUser,
  isAuthenticatedTorqueUser,
  TorqueUser,
  UnknownTorqueUser,
  UserMe_ApiResponseData,
} from '../torque-user/torque-user'
import { AuthContextStorage } from '../torque-user/auth-context-storage'
import buildAxiosInstance from '../axios/build-axios-instance'
import { AxiosInstance } from 'axios'
import { AuthContext } from '../torque-user/auth-context'
import { buildAuthRequestInterceptor } from '../axios/auth-request-interceptor'
import { fetchUserForAuthToken } from '../utils/fetch-user-for-auth-token'
import { AxiosOptions } from '../axios/axios-options'

export {
  BaseTorqueUser, UnknownTorqueUser, isUnknownTorqueUser, AuthenticatedTorqueUser, isAuthenticatedTorqueUser,
} from '../torque-user/torque-user'
export { TorqueUserPersona } from '../torque-user/torque-user-persona'
export { AuthContext } from '../torque-user/auth-context'


/**
 * Primary Torque object.
 */
export class Torque {
  private readonly authCallbackUrl: string
  private readonly apiPublicKey: string
  private readonly customerHandle: string
  private readonly axiosOptions: AxiosOptions
  private readonly axiosInstance: AxiosInstance

  constructor(
    customerConfig: CustomerConfig,
  ) {
    this.authCallbackUrl = customerConfig.authCallbackUrl
    this.apiPublicKey = customerConfig.apiPublicKey
    this.customerHandle = customerConfig.customerHandle

    const axiosOptions = {
      apiPublicKey: customerConfig.apiPublicKey,
    }
    this.axiosOptions = axiosOptions
    const axiosInstance = buildAxiosInstance(axiosOptions)
    axiosInstance.interceptors.request.use(
      buildAuthRequestInterceptor(),
    )
    this.axiosInstance = axiosInstance
  }

  isTest() {
    return this.apiPublicKey.startsWith('pk_test')
  }

  private makeUrlQueryParamWithBaseParams(additionalQueryParamsMap?: Map<string, string>): string {
    const queryParamsMap = new Map(additionalQueryParamsMap || [])
    queryParamsMap.set('redirect_url', encodeURIComponent(this.authCallbackUrl))
    if (this.isTest()) {
      queryParamsMap.set('test', 'true')
    }
    const queryString =
      Array.from(queryParamsMap)
        .map((key, value) => `${key}=${value}`)
        .join('&')
    return queryString
  }

  startLoginSegment() {
    const queryParams = this.makeUrlQueryParamWithBaseParams()
    const targetUrl =
      `${TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__log_in?${queryParams}`
    window.location.href = targetUrl
  }

  startRegistrationSegment(priceId: string) {
    const queryParams = this.makeUrlQueryParamWithBaseParams(
      new Map<string, string>([
        ['price_id', priceId],
      ]),
    )
    const targetUrl =
      `${TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__user_registration?${queryParams}`
    window.location.href = targetUrl
  }

  logout(): Promise<UnknownTorqueUser> {
    AuthContextStorage.clear()
    return this.axiosInstance
      .post(`${TORQUE_API_URL}/user/logout`)
      .then(
        function onFulfilled() {
          return UnknownTorqueUser.Instance
        },
        function onRejected() {
          return UnknownTorqueUser.Instance
        },
      )
  }

  retrieveTorqueUser(): Promise<TorqueUser> {
    const authContext = AuthContextStorage.load()
    if (!authContext)
      return Promise.resolve(UnknownTorqueUser.Instance)

    return this.axiosInstance
      .get(`${TORQUE_API_URL}/user/auth`)
      .then(response => {
        const data: UserMe_ApiResponseData = response.data
        return new AuthenticatedTorqueUser(
          authContext,
          data.user.id,
          data.user.email,
          data.user.given_name,
          data.user.family_name,
          data.user.customer_specific_data,
        )
      })
      .catch(error => {
        return this.logout()
      })
  }

  handleAuthenticationCallback(
    authToken: string,
  ): Promise<{ user: TorqueUser }> {
    return fetchUserForAuthToken(this.axiosOptions, authToken)
      .then(
        user => {
          if (isAuthenticatedTorqueUser(user))
            AuthContextStorage.store(user.auth)
          return {
            user,
          }
        },
        reason => ({
          user: UnknownTorqueUser.Instance,
        }),
      )
  }
}
