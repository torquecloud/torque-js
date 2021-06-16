import {Torque, initTorque} from "../lib";


test('initTorque', async () => {
  const torqueOrError = await initTorque({
    apiPublicKey: 'pk_test_xyz',
    tenantId: 'org0'
  })
  expect(torqueOrError.torque).toBeInstanceOf(Torque);
});
