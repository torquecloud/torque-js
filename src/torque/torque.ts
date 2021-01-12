import { CustomerConfig } from '../customer/customer-config'
import { TORQUE_API_URL, TORQUE_USER_FLOWS_WEBAPP_URL } from '../package-config'
import { AuthenticatedTorqueUser, isAuthenticatedTorqueUser, UnknownTorqueUser, TorqueUser, UserMe_ApiResponseData } from '../torque-user/torque-user'
import { AuthContextStorage } from '../torque-user/auth-context-storage'
import buildAxiosInstance from '../axios/build-axios-instance'
import { AxiosInstance } from 'axios'
import { AuthContext } from '../torque-user/auth-context'
import { buildAuthRequestInterceptor } from '../axios/auth-request-interceptor'
import { fetchUserForAuthContext } from '../utils/fetch-user-for-auth-token'
import { AxiosOptions } from '../axios/axios-options'

export { BaseTorqueUser, UnknownTorqueUser, isUnknownTorqueUser, AuthenticatedTorqueUser, isAuthenticatedTorqueUser } from '../torque-user/torque-user'
export { TorqueUserPersona } from '../torque-user/torque-user-persona'
export { AuthContext } from '../torque-user/auth-context'


/**
 * Primary Torque object.
 */
export class Torque {
  private readonly apiPublicKey: string
  private readonly customerHandle: string
  private readonly axiosOptions: AxiosOptions
  private readonly axiosInstance: AxiosInstance

  constructor(
    customerConfig: CustomerConfig,
  ) {
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

  startLoginSegment() {
    const targetUrl = `${TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__log_in`
    window.location.href = targetUrl
  }

  startRegisterSegment() {
    const targetUrl = `${TORQUE_USER_FLOWS_WEBAPP_URL}/${this.customerHandle}/projsim__user_registration`
    window.location.href = targetUrl
  }

  logout(): Promise<UnknownTorqueUser> {
    AuthContextStorage.clear()
    return this.axiosInstance
      .post(`${TORQUE_API_URL}/user/logout`)
      .then(
        function onFulfilled(o) {
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
      .get(`${TORQUE_API_URL}/user/me`)
      .then(response => {
        const data: UserMe_ApiResponseData = response.data
        return new AuthenticatedTorqueUser(
          authContext,
          data.user.id,
          data.user.email,
          data.user.given_name,
          data.user.family_name,
        )
      })
      .catch(error => {
        return this.logout()
      })
  }

  handleAuthenticationCallback(
    authToken: string,
    expiresOnIso: string,
  ): Promise<{ user: TorqueUser }> {
    const callbackAuthContext =
      new AuthContext({
        authToken,
        expiresOnIso,
      })

    return fetchUserForAuthContext(this.axiosOptions, callbackAuthContext)
      .then(
        user => {
          AuthContextStorage.store(callbackAuthContext)
          return {
            user
          }
        },
        reason => ({
          user: UnknownTorqueUser.Instance,
        }),
      )
  }
}
