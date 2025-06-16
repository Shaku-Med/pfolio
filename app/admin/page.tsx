import React from 'react'
import Home from './Pages/Home/Home'
import { calculateStats } from './Pages/Home/server/adminStats'

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
