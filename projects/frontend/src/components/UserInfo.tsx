import React from 'react'
import { User } from '../types'

interface UserInfoProps {
  user: User | null
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  if (!user) return null

  return (
    <div id="user-info" className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-md">
      <p>Address: {user.address}</p>
      <p>Balance: {user.balance}</p>
    </div>
  )
}
