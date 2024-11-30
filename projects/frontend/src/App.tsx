import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { Connect } from './Connect'
import './App.css'

const walletManager = new WalletManager({
  wallets: [WalletId.DEFLY, WalletId.EXODUS, WalletId.KMD, WalletId.PERA],
  network: NetworkId.TESTNET,
})

function App() {
  return (
    <WalletProvider manager={walletManager}>
      <div></div>
      <h1>Decentralized Escrow Service</h1>
      <Connect />
    </WalletProvider>
  )
}

export default App
