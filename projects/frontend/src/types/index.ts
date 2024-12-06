export interface User {
  address: string
  balance: number
}

export interface Escrow {
  applicationId: number
  senderAddress: string
  receiverAddress: string
  amount: number
  deadline: string
  condition: boolean
  createdAt: string
}

export interface DataStore {
  users: User[]
  escrows: Escrow[]
}
