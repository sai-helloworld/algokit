import * as algokit from '@algorandfoundation/algokit-utils'
import { EscrowServiceClient } from './contracts/EscrowService'

export function create(algorand: algokit.AlgorandClient, esClient: EscrowServiceClient, worker: string, adminAddress: string) {
  return async () => {
    await esClient.create.createApplication({ worker: worker, adminAddress: adminAddress })
  }
}
