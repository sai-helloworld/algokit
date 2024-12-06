import React, { useState } from 'react'
import { User } from '../types'
import { dataStore } from '../dtaStore'

interface WalletConnectProps {
  onConnect: (user: User) => void
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [showInput, setShowInput] = useState(false)
  const [address, setAddress] = useState('')

  const handleConnect = () => {
    const user = dataStore.findUser(address)
    if (user) {
      onConnect(user)
    } else {
      alert('Invalid wallet address!')
    }
  }

  if (!showInput) {
    return (
      <div className="form-container">
        <button onClick={() => setShowInput(true)} className="button">
          <i className="fas fa-wallet icon"></i>
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="wallet-address">Enter Wallet Address:</label>
        <input
          type="text"
          id="wallet-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your wallet address"
        />
      </div>
      <button onClick={handleConnect} className="button">
        <i className="fas fa-link icon"></i>
        Connect
      </button>
    </div>
  )
}
