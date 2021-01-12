import {initTorque} from "../src";
import { AuthContext, Torque } from '../src/torque/torque'
import { AuthContextStorage } from '../src/torque-user/auth-context-storage'

class LocalStorageMock {
  private store: any;

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value:any) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}
Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });

test('initTorque', async () => {
  AuthContextStorage.store(new AuthContext({
    authToken: "auth_xyz",
    expiresOnIso: "2021-01-09T23:40:00+00:00"
  }))

  const torque = await initTorque('pk_xyz')
  const user = await torque.retrieveTorqueUser();
  expect(torque).toBeInstanceOf(Torque);
});
