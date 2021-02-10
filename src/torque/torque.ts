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
import { AxiosInstance } from 'axios'
import { fetchUserForAuthToken } from '../utils/fetch-user-for-auth-token'
import { AxiosOptions } from '../axios/axios-options'
import { TorqueError, TorqueErrorType } from './torque-error'
import { Price } from '../price/price'
import { buildAxiosInstanceWithAuthInterceptor } from '../axios/build-axios-instance'


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
    this.axiosInstance = buildAxiosInstanceWithAuthInterceptor(axiosOptions)
  }

  isUsingTestData(): boolean {
    return this.apiPublicKey.startsWith('pk_test_')
  }

  private makeUrlQueryParamWithBaseParams(
    additionalQueryParamsMap: Map<string, string> = new Map(),
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
    if (doesAdditionalQueryParamsContainBaseParams) {
      console.warn(
        `'additionalQueryParamsMap' contains one or more base params. These elements from 'additionalQueryParamsMap' will be ignored and base params will be used instead.`)
    }
    const finalQueryParamsMap = new Map([
      ...additionalQueryParamsMap,
      ...baseQueryParamsMap,
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

  startLoginSegment(): Promise<never | { error: TorqueError }> {
    return new Promise<{ error: TorqueError }>(() => {
      window.location.href = this.makeLoginSegmentUrl()
    }).catch(reason => {
      return {
        error: {
          type: TorqueErrorType.unknown_error,
          message: `Unknown error happened while starting login user flow segment.`,
          rawReason: reason,
        },
      }
    })
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

  startRegistrationSegment(
    priceId: string,
  ): Promise<never | { error: TorqueError }> {
    return new Promise<{ error: TorqueError }>(() => {
      window.location.href = this.makeRegistrationSegmentUrl(priceId)
    }).catch(reason => {
      return {
        error: {
          type: TorqueErrorType.unknown_error,
          message: `Unknown error happened while starting registration user flow segment.`,
          rawReason: reason,
        },
      }
    })
  }

  logout(): Promise<{ error?: TorqueError }> {
    return this.axiosInstance
      .post(`${packageConfig.TORQUE_API_URL}/user/me/logout`)
      .then(() => {
          AuthContextStorage.clear()
          return {}
        },
      ).catch(reason => {
        return {
          error: {
            type: TorqueErrorType.unknown_error,
            message: `Unknown error happened while logging out.`,
            rawReason: reason,
          },
        }
      })
  }

  retrieveTorqueUser(): Promise<{ user?: TorqueUser, error?: TorqueError }> {
    const authContext = AuthContextStorage.load()
    if (!authContext)
      return Promise.resolve({
        user: UnknownTorqueUser.Instance,
      })

    return this.axiosInstance
      .get(`${packageConfig.TORQUE_API_URL}/user/me/auth`)
      .then(response => {
        const data: UserMe_ApiResponseData = response.data
        const authenticatedTorqueUser = new AuthenticatedTorqueUser(
          authContext,
          data.user.id,
          data.user.email,
          data.user.given_name,
          data.user.family_name,
          data.user.customer_specific_data,
        )
        return {
          user: authenticatedTorqueUser,
        }
      })
      .catch(reason => {
        return {
          error: {
            type: TorqueErrorType.unknown_error,
            message: `Unknown error happened while retrieving user.`,
            rawReason: reason,
          },
        }
      })
  }

  retrievePriceByHandle(priceHandle: string): Promise<{ price?: Price, error?: TorqueError }> {
    if(typeof priceHandle !== 'string')
      return Promise.resolve({
        error: {
          type: TorqueErrorType.invalid_parameter,
          message: `'priceHandle' has to be of type string.`
        }
      })
    if(!priceHandle)
      return Promise.resolve({
        error: {
          type: TorqueErrorType.invalid_parameter,
          message: `'priceHandle' cannot be empty string.`
        }
      })

    return this.axiosInstance
      .get(`${packageConfig.TORQUE_API_URL}/price/by-handle/${priceHandle}`)
      .then(response => {
        const price: Price = response.data
        return {
          price
        }
      })
      .catch(reason => {
        return {
          error: {
            type: TorqueErrorType.unknown_error,
            message: `Unknown error happened while retrieving user.`,
            rawReason: reason,
          },
        }
      })
  }

  handleAuthenticationCallback(
    authToken: string,
  ): Promise<{ user?: TorqueUser, error?: TorqueError }> {
    return fetchUserForAuthToken(this.axiosOptions, authToken)
      .then(user => {
          if (isAuthenticatedTorqueUser(user))
            AuthContextStorage.store(user.auth)
          return {
            user,
          }
        },
      )
      .catch(reason => {
        return {
          error: {
            type: TorqueErrorType.unknown_error,
            message: `Unknown error happened while handling authentication callback.`,
            rawReason: reason,
          },
        }
      })
  }
}
