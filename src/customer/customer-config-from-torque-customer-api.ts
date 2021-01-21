import * as z from 'zod';

export type CustomerConfigFromTorqueCustomerApi_ApiResponseData = {
  customer_config: {
    customer_handle: string
  }
}

export const customerConfigFromTorqueCustomerApi_responseValidationSchema =
  z.object({
    customer_config: z.object({
      customer_handle: z.string()
    })
  })

export type CustomerConfigFromTorqueCustomerApi = {
  customerHandle: string
}
