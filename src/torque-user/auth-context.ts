export type AuthContextData =
  Readonly<{
    authToken: string,
    expiresOnIso: string
  }>

export class AuthContext{
  readonly authToken: string
  readonly expiresOnIso: string

  constructor(authData: AuthContextData) {
    this.authToken = authData.authToken
    this.expiresOnIso = authData.expiresOnIso
  }
}
