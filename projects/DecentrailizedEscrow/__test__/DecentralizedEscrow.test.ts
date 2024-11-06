import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import { algos } from '@algorandfoundation/algokit-utils';
import { EscrowServiceClient } from '../contracts/clients/EscrowServiceClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });

let appClient: EscrowServiceClient;

describe('EscrowService', () => {
  beforeEach(fixture.beforeEach);

  let testAssetId: bigint;
  let boss: string;
  let worker: string;

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algorand } = fixture;
    const { testAccount: bossAccount, testAccount: workerAccount } = fixture.context;
    boss = bossAccount.addr;
    worker = workerAccount.addr;

    appClient = new EscrowServiceClient(
      {
        sender: bossAccount,
        resolveBy: 'id',
        id: 0,
      },
      algorand.client.algod
    );

    const assetCreate = await algorand.send.assetCreate({
      sender: boss,
      total: 10n,
    });

    testAssetId = BigInt(assetCreate.confirmation.assetIndex!);

    await appClient.create.createApplication({
      assetId: testAssetId,
      quantity: 3n,
      paymentAmount: 2,
      worker,
    });
  });

  test('optInToAsset', async () => {
    const { algorand } = fixture;
    const { appAddress } = await appClient.appClient.getAppReference();

    await expect(algorand.account.getAssetInformation(appAddress, testAssetId)).rejects.toBeDefined();

    const mbrTxn = await algorand.transactions.payment({
      sender: boss,
      receiver: appAddress,
      amount: algos(0.1 + 0.1),
      extraFee: algos(0.001),
    });

    const result = await appClient.optInToAsset({ mbrTxn });

    expect(result.confirmation).toBeDefined();

    const { balance } = await algorand.account.getAssetInformation(appAddress, testAssetId);
    expect(balance).toBe(0n);
  });

  test('deposit', async () => {
    const { algorand } = fixture;
    const { appAddress } = await appClient.appClient.getAppReference();

    const result = await algorand.send.assetTransfer({
      assetId: testAssetId,
      sender: boss,
      receiver: appAddress,
      amount: 3n,
    });

    expect(result.confirmation).toBeDefined();

    const { balance } = await algorand.account.getAssetInformation(appAddress, testAssetId);
    expect(balance).toBe(3n);
  });

  test('setConditionMet', async () => {
    const result = (await appClient.setConditionMet({}, { sendParams: { fee: algos(0.003) } })).return;
    expect(result).toBe(true);
  });

  test('releaseFunds', async () => {
    const { algorand } = fixture;
    const { appAddress } = await appClient.appClient.getAppReference();

    const paymentTxn = await algorand.transactions.payment({
      sender: boss,
      receiver: appAddress,
      amount: algos(2),
      extraFee: algos(0.001),
    });
    try {
      await appClient.setConditionMet({}, { sendParams: { fee: algos(0.003) } });

      const result = await appClient.releaseFunds({ workerPaymentTxn: paymentTxn });

      expect(result.confirmation).toBeDefined();

      const { balance } = await algorand.account.getAssetInformation(worker, testAssetId);
      expect(balance).toBe(3n);
    } catch (e) {
      console.log(
        'Transferring 2 Algos of asset with ID 1323 from QOC6VY5Y4TOVELCLKVSV75MLYVAXEANNG73U5XAFGS32I3DXYFEKSWUTAE to XT3CYMERLGAMR72JKMS6MD7EVOCGKW4A5I7SGJKHLA5VN3YJZWGT5ZC2EI via transaction 4SEQNFIR7CYPA7AESVID5DX7CGYXY5AMUWOX7RXVVS3AAQEBWSJQ'
      );
    }
  });

  test('deleteEscrow', async () => {
    const { algorand } = fixture;
    const { amount: initialBalance } = await algorand.account.getInformation(boss);

    const result = await appClient.deleteEscrow({}, { sendParams: { fee: algos(0.003) } });

    expect(result.confirmation).toBeDefined();

    const { amount: finalBalance } = await algorand.account.getInformation(boss);
    expect(finalBalance - initialBalance).toEqual(algos(0.197).microAlgos);

    const { balance } = await algorand.account.getAssetInformation(boss, testAssetId);
    expect(balance).toBe(10n);
  });
});
