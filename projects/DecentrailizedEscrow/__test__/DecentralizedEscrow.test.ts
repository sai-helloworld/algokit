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

  let boss: string;
  let worker: string;

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algorand } = fixture;
    const { testAccount: bossAccount, testAccount: workerAccount } = fixture.context;
    boss = bossAccount.addr;
    worker = workerAccount.addr;
    const adminAddress = 'KK45KH6PIPO7FXGMETBJ5FC3BJ7KYRU4NTT65H5VISFDU5DIYYMDGH6C3M';

    appClient = new EscrowServiceClient(
      {
        sender: bossAccount,
        resolveBy: 'id',
        id: 0,
      },
      algorand.client.algod
    );

    await appClient.create.createApplication({
      worker,
      adminAddress,
    });
  });

  test('addFundsToEscrow', async () => {
    const { algorand } = fixture;
    const { appAddress } = await appClient.appClient.getAppReference();

    const escrowPaymentTxn = await algorand.transactions.payment({
      sender: boss,
      receiver: appAddress,
      amount: algos(3),
    });

    const result = await appClient.addFundsToEscrow({ ebaTxn: escrowPaymentTxn });

    expect(result.confirmation).toBeDefined();

    const { amount } = await algorand.account.getInformation(appAddress);
    expect(amount).toBeGreaterThanOrEqual(algos(3).microAlgos);
  });

  test('setConditionMet', async () => {
    const result = (await appClient.setConditionMet({}, { sendParams: { fee: algos(0.003) } })).return;
    expect(result).toBe(true);
  });

  test('releaseFunds', async () => {
    const { algorand } = fixture;

    await appClient.setConditionMet({});

    const result = await appClient.releaseFunds({}, { sendParams: { fee: algos(0.002) } });

    expect(result.confirmation).toBeDefined();

    const { amount } = await algorand.account.getInformation(worker);
    expect(amount).toBeGreaterThan(0);
  });

  test('deleteEscrow', async () => {
    const { algorand } = fixture;
    const { amount: initialBalance } = await algorand.account.getInformation(boss);

    const result = await appClient.delete.deleteApplication({}, { sendParams: { fee: algos(0.002) } });

    expect(result.confirmation).toBeDefined();

    const { amount: finalBalance } = await algorand.account.getInformation(boss);

    expect(finalBalance - initialBalance).toEqual(-algos(0.002).microAlgos);
  });
});
