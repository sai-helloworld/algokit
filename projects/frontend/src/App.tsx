import { NetworkId, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { AlgoIcon, WalletIcon } from './components/Icons'
import { dataStore } from './dtaStore'
import { Connect } from './Connect'
import EscrowApp from './components/EscrowApp'
import './App.css'

const walletManager = new WalletManager({
  wallets: [WalletId.DEFLY, WalletId.EXODUS, WalletId.KMD, WalletId.PERA],
  network: NetworkId.TESTNET,
})

function AppContent() {
  const { activeAddress } = useWallet()
  const user = activeAddress ? dataStore.findUser(activeAddress) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* <AlgoIcon className="w-12 h-12" /> */}
            <h1 className="text-4xl font-bold text-white">Decentralized Escrow Service</h1>
          </div>
          <Connect />
        </div>

        {user ? (
          <EscrowApp user={user} />
        ) : (
          <div className="text-center mt-16">
            {/* <WalletIcon className="w-24 h-24 mx-auto mb-4 text-white" /> */}
            <p className="text-xl text-white">Please connect your wallet to continue</p>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <WalletProvider manager={walletManager}>
      <AppContent />
    </WalletProvider>
  )
}

export default App
