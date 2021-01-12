import { AuthenticatedTorqueUser, UnknownTorqueUser, TorqueUser, UserMe_ApiResponseData } from '../torque-user/torque-user'
import buildAxiosInstance from '../axios/build-axios-instance'
import { TORQUE_API_URL } from '../package-config'
import { AuthContext } from '../torque-user/auth-context'
import { makeAuthHeader } from '../axios/auth-request-interceptor'
import { AxiosOptions } from '../axios/axios-options'

export function fetchUserForAuthContext(
  axiosOptions: AxiosOptions,
  authContext: AuthContext,
): Promise<TorqueUser> {
  const axiosInstanceWithoutAuthHeader = buildAxiosInstance(axiosOptions)
  const authHeader = makeAuthHeader(authContext.authToken)
  return axiosInstanceWithoutAuthHeader
    .get(
      `${TORQUE_API_URL}/user/me`,
      {
        headers: {
          [authHeader.name]: authHeader.value,
        },
      },
    )
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
    .catch(reason => {
      return UnknownTorqueUser.Instance
    })
}
