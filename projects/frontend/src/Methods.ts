import * as algokit from '@algorandfoundation/algokit-utils'
import { EscrowServiceClient } from './contracts/EscrowService'

/**
 * Create the escrow application and opt it into the specified asset
 */
export function createEscrow(
  algorand: algokit.AlgorandClient,
  escrowClient: EscrowServiceClient,
  sender: string,
  assetId: bigint,
  quantity: bigint,
  paymentAmount: bigint,
  worker: string,
  setAppId: (id: number) => void,
) {
  return async () => {
    const createResult = await escrowClient.create.createApplication({ assetId, quantity, paymentAmount, worker })

    const mbrTxn = await algorand.transactions.payment({
      sender,
      receiver: createResult.appAddress,
      amount: algokit.algos(0.2), // Adjust based on required MBR
      extraFee: algokit.algos(0.001),
    })

    await escrowClient.optInToAsset({ mbrTxn })

    await algorand.send.assetTransfer({
      assetId,
      sender,
      receiver: createResult.appAddress,
      amount: quantity,
    })

    setAppId(Number(createResult.appId))
  }
}

/**
 * Set the condition as met, allowing fund release
 */
export function setCondition(
  escrowClient: EscrowServiceClient,
  sender: string,
  setConditionMet: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return async () => {
    await escrowClient.setConditionMet({})
    setConditionMet(true)
  }
}

/**
 * Release funds from escrow to the worker if the condition is met
 */
export function releaseFunds(
  algorand: algokit.AlgorandClient,
  escrowClient: EscrowServiceClient,
  sender: string,
  appAddress: string,
  paymentAmount: bigint,
  setUnitsTransferred: React.Dispatch<React.SetStateAction<bigint>>,
) {
  return async () => {
    const workerPaymentTxn = await algorand.transactions.payment({
      sender,
      receiver: appAddress,
      amount: algokit.microAlgos(Number(paymentAmount)),
      extraFee: algokit.algos(0.001),
    })

    await escrowClient.releaseFunds({
      workerPaymentTxn,
    })

    const state = await escrowClient.getGlobalState()
    const info = await algorand.account.getAssetInformation(appAddress, state.assetId!.asBigInt())
    setUnitsTransferred(info.balance)
  }
}

/**
 * Delete the escrow application and return assets/funds to the boss
 */
export function deleteEscrow(escrowClient: EscrowServiceClient, setAppId: (id: number) => void) {
  return async () => {
    await escrowClient.deleteEscrow({}, { sendParams: { fee: algokit.algos(0.003) } })
    setAppId(0)
  }
}
