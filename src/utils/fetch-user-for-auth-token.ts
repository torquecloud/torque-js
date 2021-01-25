import { AuthenticatedTorqueUser, UnknownTorqueUser, TorqueUser, UserMe_ApiResponseData } from '../torque-user/torque-user'
import buildAxiosInstance from '../axios/build-axios-instance'
import packageConfig from '../config/package-config'
import { makeAuthHeader } from '../axios/auth-request-interceptor'
import { AxiosOptions } from '../axios/axios-options'
import { AuthContext } from '../torque-user/auth-context'

export function fetchUserForAuthToken(
  axiosOptions: AxiosOptions,
  authToken: string,
): Promise<TorqueUser> {
  const axiosInstanceWithoutAuthHeader = buildAxiosInstance(axiosOptions)
  const authHeader = makeAuthHeader(authToken)
  return axiosInstanceWithoutAuthHeader
    .get(
      `${packageConfig.TORQUE_API_URL}/user/me/auth`,
      {
        headers: {
          [authHeader.name]: authHeader.value,
        },
      },
    )
    .then(response => {
      const data: UserMe_ApiResponseData = response.data
      const authContext = new AuthContext({
        authToken:data.auth.auth_token,
        expiresOnIso: data.auth.expires_on_iso
      })
      return new AuthenticatedTorqueUser(
        authContext,
        data.user.id,
        data.user.email,
        data.user.given_name,
        data.user.family_name,
        data.user.customer_specific_data
      )
    })
    .catch(reason => {
      return UnknownTorqueUser.Instance
    })
}
