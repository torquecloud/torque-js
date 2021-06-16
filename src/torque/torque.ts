import packageConfig from '../config/package-config'


export type CustomerConfig = {
  tenantId: string
  apiPublicKey: string
}


/**
 * Primary Torque object.
 */
export class Torque {
  private readonly tenantId: string
  private readonly apiPublicKey: string

  constructor(
    customerConfig: CustomerConfig,
  ) {
    this.tenantId = customerConfig.tenantId
    this.apiPublicKey = customerConfig.apiPublicKey
  }

  isUsingTestData(): boolean {
    return this.apiPublicKey.startsWith('pk_test_')
  }

  httpGetAsync(path: string): Promise<string> {
    const tenantId = this.tenantId;
    const apiPublicKey = this.apiPublicKey;

    return new Promise<string>(function (resolve, reject) {
      const INSTANCE_ID = 'test-module-instance-01'
      const url = `https://${tenantId}.mytorque.cloud/${INSTANCE_ID}${path}`

      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader('Torque-JS-Package-Version', packageConfig.TORQUE_JS_PACKAGE_VERSION);
      xhr.setRequestHeader('Torque-API-Public-Key', apiPublicKey)
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      }
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send(null);
    })
  }
}
