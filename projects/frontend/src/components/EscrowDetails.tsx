import React from 'react'
import { Escrow } from '../types'
import { dataStore } from '../dtaStore'

interface EscrowDetailsProps {
  escrow: Escrow
  onComplete: () => void
}

export const EscrowDetails: React.FC<EscrowDetailsProps> = ({ escrow, onComplete }) => {
  const handleComplete = () => {
    const updatedEscrow = dataStore.completeEscrow(escrow.applicationId)
    if (updatedEscrow) {
      const receiver = dataStore.findUser(updatedEscrow.receiverAddress)
      if (receiver) {
        receiver.balance += updatedEscrow.amount
        dataStore.updateUserBalance(receiver.address, receiver.balance)
        dataStore.deleteEscrow(updatedEscrow.applicationId)
        alert('Escrow completed and funds transferred!')
        onComplete()
      }
    }
  }

  return (
    <div className="form-container  escrow_details_2">
      <h3>Escrow Details</h3>
      <p>Application ID: {escrow.applicationId}</p>
      <p>Sender: {escrow.senderAddress}</p>
      <p>Receiver: {escrow.receiverAddress}</p>
      <p>Amount: {escrow.amount}</p>
      <p>Deadline: {escrow.deadline}</p>
      <p>Condition: {escrow.condition ? 'Met' : 'Not Met'}</p>
      <p>Created: {new Date(escrow.createdAt).toLocaleDateString()}</p>
      <button onClick={handleComplete}>Complete Escrow</button>
      <button onClick={onComplete}>Back</button>
    </div>
  )
}
