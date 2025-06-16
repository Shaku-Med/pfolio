'use client'
import React from 'react'
import UserCard from './UserCard'

interface User {
  user_id: string
  user_ua: string
  ip: string
  created_at: string
  is_blocked: boolean
}

interface UserGridProps {
  users: User[]
}

const UserGrid = ({ users }: UserGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.user_id}
          id={user.user_id}
          name={user.user_ua}
          ip={user.ip}
          createdAt={user.created_at}
          isBlocked={user.is_blocked}
        />
      ))}
    </div>
  )
}

export default UserGrid 