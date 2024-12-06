import { DataStore, User, Escrow } from './types'

class EscrowDataStore {
  private data: DataStore = {
    users: [
      { address: 'GIALAS4DR5LZFZPPOSFHKIKLXFWWMNR5ORDJKFW6GWOQWN43AJASDDEQ7Y', balance: 1200 },
      { address: 'WGWT3VNXNIAKV37V4UXOEDEAZYJOVLFVVIGS6M2RHXFY4UZ7YGZ5CRGJ64', balance: 2500 },
      { address: 'EIUDLSII3ZK5R3Q376LGOWXCZWACNBAOWEVD5WOZZLB2IVFGBO4XYLIAVI', balance: 1750 },
      { address: 'KK45KH6PIPO7FXGMETBJ5FC3BJ7KYRU4NTT65H5VISFDU5DIYYMDGH6C3M', balance: 800 },
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
