import * as z from 'zod';

export type CustomerConfig_ApiResponse = {
  customer_config: {
    customer_handle: string
  }
}

export const customerConfigApiResponseValidationSchema =
  z.object({
    customer_config: z.object({
      customer_handle: z.string()
    })
  })

export type CustomerConfig = {
  customerHandle: string
  apiPublicKey: string
}
