export interface Price {
  readonly id: string
  readonly handle: string
  readonly name: string
  readonly description?: string
  readonly amount: number
  readonly price_type: 'recurring' | 'one_time'
}

