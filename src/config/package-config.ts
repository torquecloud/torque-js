import packageJson from './package.json-replica-for-config.json'

/* package.json-replica-for-config.json is used instead of package.json
* because importing package.json would affect tsc build,
* it would "copy" whole src folder to dist.
* Also when using package.json property 'rootDir' inside tsconfig.json
* needs to be '.' (whole project) instead of just './src'.
* */
const TORQUE_JS_PACKAGE_VERSION = packageJson.version

// declare global {
//   interface Window {
//     /* Global configuration used for testing/debugging purposes. */
//     Torque?: {
//       /* Used to override default TORQUE_API_URL */
//       TORQUE_API_URL?: string;
//     }
//   }
// }
//
// const TORQUE_API_URL =
//   window?.Torque?.TORQUE_API_URL
//   || 'https://api.torque.cloud'

const packageConfig = {
  TORQUE_JS_PACKAGE_VERSION,
  // TORQUE_API_URL,
}
export default packageConfig
