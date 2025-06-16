import React from 'react'
import Home from '@/app/admin/Pages/Home/Home'
import { calculateStats } from '@/app/admin/Pages/Home/server/adminStats'

interface HomeProps {
  stats: {
    users: { total: number; percentage_change: number }
    active_sessions: { total: number; percentage_change: number }
    system_load: { total: number; percentage_change: number }
    security_score: { score: number; percentage_change: number }
  }
}

const page = async () => {
  const stats = await calculateStats()
  if (!stats) return null

  return (
    <>
      <Home stats={stats} />
    </>
  )
}

export default page
