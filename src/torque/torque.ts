import { CustomerConfig } from '../customer/customer-config'
import packageConfig from '../config/package-config'
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
  private readonly apiPublicKey: string
  private readonly fallbackUrl?: string
  private readonly authCallbackUrl?: string
  private readonly customerHandle: string
  private readonly axiosOptions: AxiosOptions
  private readonly axiosInstance: AxiosInstance

  constructor(
    customerConfig: CustomerConfig,
  ) {
    this.apiPublicKey = customerConfig.apiPublicKey
    this.fallbackUrl = customerConfig.fallbackUrl
    this.authCallbackUrl = customerConfig.authCallbackUrl
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

  isUsingTestData(): boolean {
    return this.apiPublicKey.startsWith('pk_test_')
  }

  private makeUrlQueryParamWithBaseParams(
    additionalQueryParamsMap: Map<string, string> = new Map()
  ): string {
    const baseQueryParamsMap = new Map()
    if (this.authCallbackUrl)
      baseQueryParamsMap.set('auth_callback_url', encodeURIComponent(this.authCallbackUrl))
    if (this.fallbackUrl)
      baseQueryParamsMap.set('fallback_url', encodeURIComponent(this.fallbackUrl))
    if (this.isUsingTestData()) {
      baseQueryParamsMap.set('use_test_data', 'true')
    }

    const doesAdditionalQueryParamsContainBaseParams =
      [...baseQueryParamsMap.keys()]
      .some(paramName => additionalQueryParamsMap.has(paramName))
    if(doesAdditionalQueryParamsContainBaseParams) {
      console.warn(
        `'additionalQueryParamsMap' contains one or more base params. These elements from 'additionalQueryParamsMap' will be ignored and base params will be used instead.`)
    }
    const finalQueryParamsMap = new Map([
      ...additionalQueryParamsMap,
      ...baseQueryParamsMap
    ])

    const queryString =
      Array.from(finalQueryParamsMap)
        .map(keyValueCouple => `${keyValueCouple[0]}=${keyValueCouple[1]}`)
        .join('&')
    return queryString
  }

  private makeLoginSegmentUrl(): string {
    const queryParams = this.makeUrlQueryParamWithBaseParams()
    const targetUrl =
      `${packageConfig.TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__log_in?${queryParams}`
    return targetUrl
  }

  startLoginSegment() {
    window.location.href = this.makeLoginSegmentUrl()
  }

  private makeRegistrationSegmentUrl(priceId: string): string {
    const additionalQueryParamsMap =
      new Map<string, string>([
        ['price_id', priceId],
      ])
    const queryParams =
      this.makeUrlQueryParamWithBaseParams(additionalQueryParamsMap)
    const targetUrl =
      `${packageConfig.TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__user_registration?${queryParams}`
    return targetUrl
  }

  startRegistrationSegment(priceId: string) {
    window.location.href = this.makeRegistrationSegmentUrl(priceId)
  }

  logout(): Promise<UnknownTorqueUser> {
    AuthContextStorage.clear()
    return this.axiosInstance
      .post(`${packageConfig.TORQUE_API_URL}/user/me/logout`)
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
      .get(`${packageConfig.TORQUE_API_URL}/user/me/auth`)
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
