# torque-js module
Torque JS library for client side with complete TypeScript declarations. 

⚛️ If you're using React check [torque-react-js](https://github.com/torquecloud/torque-react-js) module for Torque React components.

🚀 This library is in active development and currently used by companies in Torque early-access-program. Find out more about Torque and how to apply at [www.torque.cloud](https://www.torque.cloud) 

## Installation
### Yarn or NPM
Using yarn:
```shell
yarn add @torquecloud/torque-js
```
Or via npm:
```shell
npm install @torquecloud/torque-js
```

Then you can `import` torque-js components using ES Module or TypeScript syntax:
```javascript
import { Torque } from '@torquecloud/torque-js'
```
Or using CommonJS:
```javascript
const Torque = require('@torquecloud/torque-js').Torque
```

## Initialization
To start using Torque, main Torque object has to be initialized. API public key is required for initialization. `initTorque` returns `Promise<Torque>`.

```typescript
import { initTorque, TorqueInitOptions } from '@torquecloud/torque-js'

const torqueInitOptions: TorqueInitOptions = {
  apiPublicKey: 'pk_[env]_[key_string]',
  authCallbackUrl: `${window.location.origin}/torque/auth-callback`
}
const torque = initTorque(torqueInitOptions);
torque.catch(error => {
  console.log('Error handling of Torque initialization error.')
})
```

### Running Torque in test mode
To run Torque in test mode just pass your public test key to `initTorque`. All public test API keys start with `pk_test`.
```typescript
const torqueInitOptions: TorqueInitOptions = {
  apiPublicKey: 'pk_test_[key_string]',
  /* other init options */
}
```

## How to Register user?
Invoke register segment using:
```typescript
torque.startRegistrationSegment('price_[id_string]')
```
`priceId` is expected to be provided. 

This will redirect user to Torque User flows web where registration page is located. After successful registration user will be redirected to `authCallbackUrl` which was provided to `initTroque`. Torque will provide `auth_token` and `torque_user_id` on callback in URL params.

```typescript
import * as queryString from 'query-string'
import axios from 'axios'
import { isAuthenticatedTorqueUser } from '@torquecloud/torque-js'

try {
  const torqueResult = await torque.handleAuthenticationCallback(authToken)
  const torqueUser = torqueResult.user
  if (isAuthenticatedTorqueUser(torqueUser)) {
    const authenticationDetails = {
      'auth_token': torqueUser.auth.authToken,
      'torque_user_id': torqueUser.id,
    }
    // 1. Send authenticationDetails to your server to complete authentication
    await axios.post(
      `<your-server-domain>/torque/auth-callback`,
      authenticationDetails,
    )
    // 2. Redirect user other page (e.g. dashboard) when completed
    window.location.href = '/dashboard'
  } else {
    // Handle error
  }
} catch (reason) {
  // Handle error
  console.error(reason)
}
```


## How to Login user?
Invoke login segment using:
```typescript
torque.startLoginSegment()
```
This will redirect user to Torque User flows web where login page is located. After successful authentication user will be redirected to `authCallbackUrl` which was provided to `initTroque`. Torque will provide `auth_token` and `torque_user_id` on callback in URL params.

Handle authentication callback on frontend and send `auth_token` and `torque_user_id` to your server to complete authentication.

```typescript
import * as queryString from 'query-string'
import axios from 'axios'
import { isAuthenticatedTorqueUser } from '@torquecloud/torque-js'

try {
  const torqueResult = await torque.handleAuthenticationCallback(authToken)
  const torqueUser = torqueResult.user
  if (isAuthenticatedTorqueUser(torqueUser)) {
    const authenticationDetails = {
      'auth_token': torqueUser.auth.authToken,
      'torque_user_id': torqueUser.id,
    }
    // 1. Send authenticationDetails to your server to complete authentication
    await axios.post(
      `<your-server-domain>/torque/auth-callback`,
      authenticationDetails,
    )
    // 2. Redirect user other page (e.g. dashboard) when completed
    window.location.href = '/dashboard'
  } else {
    // Handle error
  }
} catch (reason) {
  // Handle error
  console.error(reason)
}
```

## How to log user out?
Use synchronous logout method:
```typescript
torque.logout()
```
