export interface Contract {
  monthlyPayment: Contract.MonthlyPaymentValue
  payments: any
}

export namespace Contract {
  export type MonthlyPaymentValue = Number
  export type Payment = any
}
