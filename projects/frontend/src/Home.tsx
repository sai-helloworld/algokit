// src/components/Home.tsx
import { Config as AlgokitConfig } from '@algorandfoundation/algokit-utils';
import AlgorandClient from '@algorandfoundation/algokit-utils/types/algorand-client';
import { useWallet } from '@txnlab/use-wallet';
import React, { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import MethodCall from './components/MethodCall';
import { EscrowServiceClient } from './contracts/EscrowService';
import * as methods from './Methods';
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  AlgokitConfig.configure({ populateAppCallResources: true });

  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const [appId, setAppId] = useState<number>(0);
  const [assetId, setAssetId] = useState<bigint>(0n);
  const [quantity, setQuantity] = useState<bigint>(0n);
  const [paymentAmount, setPaymentAmount] = useState<bigint>(0n);
  const [conditionMet, setConditionMet] = useState<boolean>(false);
  const [workerAddress, setWorkerAddress] = useState<string | undefined>(undefined);
  const [unitsTransferred, setUnitsTransferred] = useState<bigint>(0n);
  const { activeAddress, signer } = useWallet();

  // Set up Algorand client configuration
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = AlgorandClient.fromConfig({ algodConfig });
  algorand.setDefaultSigner(signer);

  // Instantiate Escrow Service Client when App ID changes
  const escrowClient = new EscrowServiceClient(
    {
      resolveBy: 'id',
      id: appId,
      sender: { addr: activeAddress!, signer },
    },
    algorand.client.algod,
  );

  // Fetch and update escrow details when App ID is updated
  useEffect(() => {
    if (appId !== 0) {
      fetchEscrowDetails();
    }
  }, [appId]);

  const fetchEscrowDetails = async () => {
    try {
      const globalState = await escrowClient.getGlobalState();
      setAssetId(globalState.assetId?.asBigInt() || 0n);
      setQuantity(globalState.quantity?.asBigInt() || 0n);
      setPaymentAmount(globalState.paymentAmount?.asBigInt() || 0n);
      setConditionMet(false);
      setWorkerAddress(globalState.worker?.asString());
    } catch (error) {
      resetEscrowDetails();
    }

    try {
      const response = await algorand.client.algod.getApplicationByID(appId).do();
      setWorkerAddress(response.params.creator); // Assuming this is the seller address
    } catch (error) {
      setWorkerAddress(undefined);
    }
  };

  const resetEscrowDetails = () => {
    setAssetId(0n);
    setQuantity(0n);
    setPaymentAmount(0n);
    setConditionMet(false);
    setWorkerAddress(undefined);
  };

  // Toggle the wallet modal
  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal);
  };

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Escrow Service <div className="font-bold">AlgoKit App</div>
          </h1>
          <p className="py-6">Manage escrow transactions securely on Algorand.</p>

          <div className="grid">
            {/* Wallet Connection Button */}
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>

            <div className="divider" />

            {/* App ID Input */}
            <label className="label">App ID</label>
            <input
              type="number"
              className="input input-bordered m-2"
              value={appId}
              onChange={(e) => setAppId(e.currentTarget.valueAsNumber || 0)}
            />

            <div className="divider" />

            {/* Form for Creating Escrow */}
            {activeAddress && appId === 0 && (
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={quantity.toString()}
                  onChange={(e) => setQuantity(BigInt(e.currentTarget.value || '0'))}
                />
                <label className="label">Payment Amount (in microAlgos)</label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={paymentAmount.toString()}
                  onChange={(e) => setPaymentAmount(BigInt(e.currentTarget.value || '0'))}
                />
                <label className="label">Worker Address</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={workerAddress || ''}
                  onChange={(e) => setWorkerAddress(e.currentTarget.value || '')}
                />

                {/* Create Escrow Button */}
                <MethodCall
                  methodFunction={
                    methods.createEscrow(
                      algorand,
                      escrowClient,
                      activeAddress,
                      assetId,
                      quantity,
                      paymentAmount,
                      workerAddress || '',
                      setAppId
                    )
                  }
                  text="Create Escrow"
                />
              </div>
            )}

            {/* Display Escrow Details if App ID is set */}
            {appId !== 0 && (
              <div>
                <label className="label">Asset ID</label>
                <input type="text" className="input input-bordered" value={assetId.toString()} readOnly />
                <label className="label">Quantity</label>
                <input type="text" className="input input-bordered" value={quantity.toString()} readOnly />
                <label className="label">Payment Amount</label>
                <input type="text" className="input input-bordered" value={paymentAmount.toString()} readOnly />
                <label className="label">Condition Met</label>
                <input type="text" className="input input-bordered" value={conditionMet ? 'Yes' : 'No'} readOnly />
                <label className="label">Worker Address</label>
                <input type="text" className="input input-bordered" value={workerAddress || ''} readOnly />
                <label className="label">Units Transferred</label>
                <input type="text" className="input input-bordered" value={unitsTransferred.toString()} readOnly />
              </div>
            )}

            <div className="divider" />

            {/* Set Condition Met Button */}
            {activeAddress && appId !== 0 && !conditionMet && (
              <MethodCall
                methodFunction={methods.setCondition(escrowClient, activeAddress, setConditionMet)}
                text="Set Condition Met"
              />
            )}

            {/* Release Funds Button */}
            {activeAddress && appId !== 0 && conditionMet && (
              <MethodCall
                methodFunction={
                  methods.releaseFunds(
                    algorand,
                    escrowClient,
                    activeAddress,
                    workerAddress || '',
                    paymentAmount,
                    setUnitsTransferred
                  )
                }
                text={`Release Funds`}
              />
            )}

            {/* Delete Escrow Button for Worker */}
            {activeAddress === workerAddress && appId !== 0 && (
              <MethodCall methodFunction={methods.deleteEscrow(escrowClient, setAppId)} text="Delete Escrow" />
            )}
          </div>

          {/* Wallet Modal Component */}
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        </div>
      </div>
    </div>
  );
};

export default Home;
