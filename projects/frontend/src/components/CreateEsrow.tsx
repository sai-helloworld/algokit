import React, { useState } from 'react'
import { User } from '../types'
import { dataStore } from '../dtaStore'

interface CreateEscrowProps {
  user: User
  onComplete: () => void
}

export const CreateEscrow: React.FC<CreateEscrowProps> = ({ user, onComplete }) => {
  const [receiverAddress, setReceiverAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dataStore.findUser(receiverAddress)) {
      alert('Invalid receiver address!')
      return
    }

    const amountNum = parseInt(amount)
    if (!amountNum || amountNum <= 0 || amountNum > user.balance) {
      alert('Invalid amount or insufficient balance!')
      return
    }

    const applicationId = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000

    const newEscrow = {
      applicationId,
      senderAddress: user.address,
      receiverAddress,
      amount: amountNum,
      deadline,
      condition: false,
      createdAt: new Date().toISOString(),
    }

    dataStore.updateUserBalance(user.address, user.balance - amountNum)
    dataStore.createEscrow(newEscrow)

    alert('Escrow created successfully!')
    onComplete()
  }

  return (
    <div className="escrow-form-container">
      <h2 className="escrow-form-title">Create New Escrow</h2>
      <form className="escrow-form" onSubmit={handleSubmit}>
        <div className="escrow-form-group">
          <label className="escrow-label">Sender Address:</label>
          <input className="escrow-input" type="text" value={user.address} disabled />
        </div>
        <div className="escrow-form-group">
          <label className="escrow-label">Receiver Address:</label>
          <input
            className="escrow-input"
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            required
          />
        </div>
        <div className="escrow-form-group">
          <label className="escrow-label">Amount:</label>
          <input className="escrow-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="escrow-form-group">
          <label className="escrow-label">Deadline:</label>
          <input className="escrow-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        </div>
        <div className="escrow-button-group">
          <button className="escrow-submit-button" type="submit">
            <i className="fas fa-check escrow-icon"></i>
            Create Escrow
          </button>
          <button className="escrow-cancel-button" type="button" onClick={onComplete}>
            <i className="fas fa-times escrow-icon"></i>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
