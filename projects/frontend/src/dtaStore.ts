import { DataStore, User, Escrow } from './types'

class EscrowDataStore {
  private data: DataStore = {
    users: [
      { address: '3BNX2B7F22TJP544D6CAU7AQOPLJ35Q3REMDF3PEXHO2DFYN7VZJRRPT2A', balance: 1200 },
      { address: 'YUP6H4KGRQSF2GHOQRJJQ6AUHKWKATCMKWNHMRARLDPXLD7DUN736MFALM', balance: 2500 },
      { address: 'LXNMFGCYSQDISKEFPR2BPKJ4FZJJN5ZVHLVF2F5KZ7CCBFUAMECRQ3CTWA', balance: 1750 },
      { address: 'AHNOZCUXNAE7DKOCFEEMNFOHFEHS5Y6MRGYHO7MDUCSREVZ5KAQIK2EKHI', balance: 800 },
    ],
    escrows: [],
  }

  constructor() {
    this.loadData()
  }

  findUser(address: string): User | undefined {
    return this.data.users.find((u) => u.address === address)
  }

  updateUserBalance(address: string, newBalance: number): boolean {
    const user = this.findUser(address)
    if (user) {
      user.balance = newBalance
      this.saveData()
      return true
    }
    return false
  }

  createEscrow(escrowData: Escrow): Escrow {
    this.data.escrows.push(escrowData)
    this.saveData()
    return escrowData
  }

  getEscrowsByAddress(address: string): Escrow[] {
    return this.data.escrows.filter((e) => e.senderAddress === address)
  }

  deleteEscrow(applicationId: number): Escrow | null {
    const index = this.data.escrows.findIndex((e) => e.applicationId === applicationId)
    if (index !== -1) {
      const escrow = this.data.escrows[index]
      this.data.escrows.splice(index, 1)
      this.saveData()
      return escrow
    }
    return null
  }

  completeEscrow(applicationId: number): Escrow | null {
    const escrow = this.data.escrows.find((e) => e.applicationId === applicationId)
    if (escrow) {
      escrow.condition = true
      this.saveData()
      return escrow
    }
    return null
  }

  private saveData(): void {
    localStorage.setItem('escrowAppData', JSON.stringify(this.data))
  }

  private loadData(): void {
    const savedData = localStorage.getItem('escrowAppData')
    if (savedData) {
      this.data = JSON.parse(savedData)
    }
  }
}

export const dataStore = new EscrowDataStore()
