'use client'
import React from 'react'
import MetricsCards from './components/MetricsCards'
import ChartsSection from './components/ChartsSection'
import SystemPerformance from './components/SystemPerformance'
import RecentActivity from './components/RecentActivity'

const Analytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <MetricsCards />
      <ChartsSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemPerformance />
        <RecentActivity />
      </div>
    </div>
  )
}

export default Analytics
