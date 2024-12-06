import React from 'react'

export const AlgoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.236L20.236 8 12 11.764 3.764 8 12 4.236zM4 16.236V9.764L12 13.528V20L4 16.236zm16 0L12 20v-6.472l8-3.764v6.472z"/>
  </svg>
)

export const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-8c0-2.21-1.79-4-4-4zm-1.5 11h-2v2H9.5v-2h-2v-1.5h2v-2h5v2h2V15zm3-4h-3V9h3v2z"/>
  </svg>
)
