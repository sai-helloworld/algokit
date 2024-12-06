import React from 'react'
import { Escrow, User } from '../types'
import { dataStore } from '../dtaStore'

interface EscrowListProps {
  user: User
  onShowDetails: (escrow: Escrow) => void
  onComplete: () => void
}

export const EscrowList: React.FC<EscrowListProps> = ({ user, onShowDetails, onComplete }) => {
  const escrows = dataStore.getEscrowsByAddress(user.address)

  const handleDelete = (escrow: Escrow) => {
    dataStore.deleteEscrow(escrow.applicationId)
    dataStore.updateUserBalance(user.address, user.balance + escrow.amount)
    onComplete()
  }

  if (escrows.length === 0) {
    return (
      <div className="form-container">
        <p>No escrows found for your address.</p>
        <button onClick={onComplete}>Back</button>
      </div>
    )
  }

  return (
    <div className="form-container">
      {escrows.map((escrow) => (
        <div key={escrow.applicationId} className="escrow-item">
          <div className="escrow-info">
            <p>ID: {escrow.applicationId}</p>
            <p>To: {escrow.receiverAddress}</p>
            <p>Amount: {escrow.amount}</p>
            <p>Status: {escrow.condition ? 'Completed' : 'Pending'}</p>
          </div>
          <div className="escrow-buttons">
            <button onClick={() => onShowDetails(escrow)}>Details</button>
            <button onClick={() => handleDelete(escrow)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>
      ))}
      <button onClick={onComplete}>Back</button>
    </div>
  )
}
