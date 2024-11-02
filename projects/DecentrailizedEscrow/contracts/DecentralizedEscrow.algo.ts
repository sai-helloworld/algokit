import { Contract } from '@algorandfoundation/tealscript';

export class EscrowService extends Contract {
  /** ID of the asset being held in escrow */
  assetId = GlobalStateKey<AssetID>();

  /** Quantity of the asset to be transferred */
  quantity = GlobalStateKey<uint64>();

  /** The agreed cost of the asset or service */
  paymentAmount = GlobalStateKey<uint64>();

  /** Address of the worker (asset receiver) */
  worker = GlobalStateKey<Address>();

  /** Indicates whether the condition for releasing funds has been met */
  conditionMet = GlobalStateKey<boolean>();

  /**
   * Initialize the escrow contract
   *
   * @param assetId The asset to be held in escrow
   * @param quantity The quantity of the asset to transfer
   * @param paymentAmount The amount the boss has to pay
   * @param worker The worker who will receive the asset if the condition is met
   */
  createApplication(assetId: AssetID, quantity: uint64, paymentAmount: uint64, worker: Address): void {
    this.assetId.value = assetId;
    this.quantity.value = quantity;
    this.paymentAmount.value = paymentAmount;
    this.worker.value = worker;
    this.conditionMet.value = false;
  }

  /**
   * Sets the condition to true, allowing funds release, and sends a message to the worker
   * This can be called by the boss upon confirmation that work is done or the asset has been delivered.
   *
   * The address of the worker to confirm identity and send a message
   */
  setConditionMet(): boolean {
    assert(this.txn.sender === this.app.creator); // Only the boss can set the condition
    this.conditionMet.value = true;
    return true;
  }
  /**
   * Opt the contract address into the asset being held in escrow.
   * This allows the contract to hold the asset securely.
   *
   * @param mbrTxn The payment transaction that covers the Minimum Balance Requirement (MBR) for opting into the asset.
   */

  optInToAsset(mbrTxn: PayTxn): void {
    // Ensure only the contract creator (boss) can opt into the asset
    assert(this.txn.sender === this.app.creator);

    // Verify the contract has not already opted into the asset
    assert(!this.app.address.isOptedInToAsset(this.assetId.value));

    // Check that the MBR transaction provides the necessary funds for opting in
    verifyPayTxn(mbrTxn, {
      receiver: this.app.address,
      amount: globals.minBalance + globals.assetOptInMinBalance, // Ensure the correct amount for MBR
    });

    // Execute the opt-in transaction for the asset
    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: 0, // Opt-in transaction (no actual transfer of asset units)
      assetReceiver: this.app.address,
    });
  }
  /**
   * Transfer funds from escrow to worker if the condition is met
   *
   * @param workerPaymentTxn The payment transaction from the boss to the contract
   */

  releaseFunds(workerPaymentTxn: PayTxn): void {
    assert(this.conditionMet.value); // Check if the condition is met

    verifyPayTxn(workerPaymentTxn, {
      receiver: this.app.address,
      amount: this.paymentAmount.value,
    });

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: this.quantity.value,
      assetReceiver: this.worker.value,
    });

    sendPayment({
      receiver: this.app.creator,
      amount: this.app.address.balance,
      closeRemainderTo: this.app.creator, // Return remaining balance to the boss
    });
  }

  /**
   * Method to cancel the escrow and delete the application
   * Returns any remaining funds or assets to the boss
   */
  deleteEscrow(): void {
    assert(this.txn.sender === this.app.creator); // Only the boss can delete the contract

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetReceiver: this.app.creator,
      assetAmount: this.app.address.assetBalance(this.assetId.value),
      assetCloseTo: this.app.creator,
    });

    sendPayment({
      receiver: this.app.creator,
      amount: this.app.address.balance,
      closeRemainderTo: this.app.creator,
    });
  }
}
