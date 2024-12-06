import React, { useState } from 'react'
import { User, Escrow } from '../types'
import { CreateEscrow } from './CreateEsrow'
import { EscrowList } from './EscrowList'
import { EscrowDetails } from './EscrowDetails'

type View = 'main' | 'create' | 'list' | 'details'

interface EscrowAppProps {
  user: User
}

const EscrowApp: React.FC<EscrowAppProps> = ({ user }) => {
  const [currentView, setCurrentView] = useState<View>('main')
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)

  const showMainContent = () => {
    setCurrentView('main')
    setSelectedEscrow(null)
  }

  const handleShowDetails = (escrow: Escrow) => {
    setSelectedEscrow(escrow)
    setCurrentView('details')
  }

  return (
    <div className="max-w-6xl mx-auto">
      {currentView === 'main' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className="bg-white rounded-xl shadow-lg p-8 hover:transform hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => setCurrentView('create')}
          >
            <div className="text-teal-600 text-4xl mb-4">+</div>
            <h3 className="text-xl font-semibold mb-2">Create Escrow</h3>
            <p className="text-gray-600">Set up a new escrow transaction</p>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-8 hover:transform hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => setCurrentView('list')}
          >
            <div className="text-teal-600 text-4xl mb-4">≡</div>
            <h3 className="text-xl font-semibold mb-2">Show My Escrows</h3>
            <p className="text-gray-600">View your active escrows</p>
          </div>
        </div>
      )}

      {currentView === 'create' && <CreateEscrow user={user} onComplete={showMainContent} />}

      {currentView === 'list' && <EscrowList user={user} onShowDetails={handleShowDetails} onComplete={showMainContent} />}

      {currentView === 'details' && selectedEscrow && <EscrowDetails escrow={selectedEscrow} onComplete={showMainContent} />}
    </div>
  )
}

export default EscrowApp
