import { AuthContext, AuthContextData } from './auth-context'

const AUTH_CONTEXT_LOCAL_STORAGE_KEY = 'torque_auth_context'
type AuthContextSerialized = {
  authToken: string
  expiresOnIso: string
}
export const AuthContextStorage = {
  store: function storeToLocalStorage(authContext: AuthContext){
    const payload:AuthContextSerialized = {
      authToken: authContext.authToken,
      expiresOnIso: authContext.expiresOnIso
    }
    localStorage.setItem(
      AUTH_CONTEXT_LOCAL_STORAGE_KEY,
      JSON.stringify(payload)
    )
  },

  load: function loadFromLocalStorage(): AuthContext | null {
    const payloadStringified = localStorage.getItem(AUTH_CONTEXT_LOCAL_STORAGE_KEY)
    if(payloadStringified){
      const payload: AuthContextSerialized = JSON.parse(payloadStringified)
      const data: AuthContextData = payload
      return new AuthContext(data);
    }
    return null;
  },

  clear: function clearFromLocalStorage(){
    localStorage.removeItem(AUTH_CONTEXT_LOCAL_STORAGE_KEY)
  }
}
