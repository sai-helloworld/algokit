import { NetworkId, WalletId, useWallet } from '@txnlab/use-wallet-react'
import React from 'react'
import { WalletIcon } from './components/Icons'

export function Connect() {
  const { activeAddress, activeNetwork, setActiveNetwork, wallets } = useWallet()

  const handleNetworkChange = (network: NetworkId) => {
    setActiveNetwork(network)
  }

  return (
    <div className="flex flex-col items-end gap-4 container_1">
      <div className="flex items-center gap-4 container_2">
        <div className="flex gap-2 container_3">
          {Object.values(NetworkId).map((network) => (
            <button
              key={network}
              onClick={() => handleNetworkChange(network)}
              className={`px-3 py-1 rounded-md text-sm ${
                activeNetwork === network ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 hover:bg-teal-50'
              }`}
            >
              {network}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="flex flex-col items-end gap-2">
            {wallet.isConnected ? (
              <div className="container_4">
                <button onClick={() => wallet.disconnect()} className="wallet-button text-sm ">
                  <WalletIcon className="w-4 h-4" />
                  Disconnect {wallet.metadata.name}
                </button>
                <br />
                {wallet.accounts.length > 0 && (
                  <select
                    onChange={(e) => wallet.setActiveAccount(e.target.value)}
                    value={activeAddress || ''}
                    className="px-3 py-1 rounded-md bg-white border border-teal-200 text-sm select_container"
                  >
                    {wallet.accounts.map((account) => (
                      <option key={account.address} value={account.address}>
                        {account.address.slice(0, 4)}...{account.address.slice(-4)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <button onClick={() => wallet.connect()} className="wallet-button text-sm wallet_button_new" disabled={wallet.isConnected}>
                <WalletIcon className="w-4 h-4" />
                Connect {wallet.metadata.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
