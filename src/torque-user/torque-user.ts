import { TorqueUserPersona } from './torque-user-persona'
import { AuthContext } from './auth-context'

export interface BaseTorqueUser {
  persona: TorqueUserPersona
}

export class UnknownTorqueUser implements BaseTorqueUser {
  get persona(): TorqueUserPersona {
    return TorqueUserPersona.Unknown
  }

  static get Instance(): UnknownTorqueUser {
    return new UnknownTorqueUser()
  }
}

export function isUnknownTorqueUser(user: BaseTorqueUser): user is UnknownTorqueUser {
  return user.persona === TorqueUserPersona.Unknown
}

export type UserMe_ApiResponseData = {
  user: {
    id: string,
    email: string
    given_name: string
    family_name: string
  }
}

export class AuthenticatedTorqueUser implements BaseTorqueUser {
  get persona(): TorqueUserPersona {
    return TorqueUserPersona.Authenticated
  }

  readonly id: string
  readonly auth: AuthContext
  readonly email: string
  readonly givenName: string
  readonly familyName: string

  constructor(
    authContext: AuthContext,
    id: string,
    email: string,
    givenName: string,
    familyName: string,
  ) {
    this.auth = authContext
    this.id = id
    this.email = email
    this.givenName = givenName
    this.familyName = familyName
  }
}

export function isAuthenticatedTorqueUser(user: TorqueUser): user is AuthenticatedTorqueUser {
  return user.persona === TorqueUserPersona.Authenticated
}

export type TorqueUser = UnknownTorqueUser | AuthenticatedTorqueUser;
