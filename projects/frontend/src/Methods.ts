import * as algokit from '@algorandfoundation/algokit-utils'
import { EscrowServiceClient } from './contracts/EscrowService'
import { algos } from '@algorandfoundation/algokit-utils'

export function create(
  algorand: algokit.AlgorandClient,
  esClient: EscrowServiceClient,
  sender: string,
  worker: string,
  admin: string,
  setAppId: (id: number) => void,
) {
  return async () => {
    const createResult = await esClient.create.createApplication({ worker, adminAddress: admin })

    setAppId(Number(createResult.appId))
  }
}

export function addFunds(
  algorand: algokit.AlgorandClient,
  esClient: EscrowServiceClient,
  sender: string,
  appAddress: string,
  paymentAmount: number,
) {
  return async () => {
    const ebaTxn = await algorand.createTransaction.payment({
      sender,
      receiver: appAddress,
      amount: algokit.algos(paymentAmount),
    })
    await esClient.addFundsToEscrow({ ebaTxn })
  }
}

export function setConditionMet(esClient: EscrowServiceClient) {
  return async () => {
    await esClient.setConditionMet({}, { sendParams: { fee: algos(0.003) } })
  }
}

export function releaseFunds(esClient: EscrowServiceClient) {
  return async () => {
    await esClient.releaseFunds({}, { sendParams: { fee: algos(0.002) } })
  }
}

export function deleteApplication(esClient: EscrowServiceClient, setAppId: (id: number) => void) {
  return async () => {
    await esClient.delete.deleteApplication({}, { sendParams: { fee: algos(0.002) } })
    setAppId(0)
  }
}
