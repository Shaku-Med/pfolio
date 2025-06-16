import React from 'react'
import WelcomeSection from './components/WelcomeSection'
import StatsGrid from './components/StatsGrid'
import QuickAccess from './components/QuickAccess'
import SystemHealth from './components/SystemHealth'
import TaskList from './components/TaskList'
import NotificationsCenter from './components/NotificationsCenter'
import RecentPosts from './components/RecentPosts'
import TeamActivity from './components/TeamActivity'
import { getSubscribedUsers } from './server/subscribedUsers'
import SubscribedUsers from './components/SubscribedUsers'
import { calculateStats } from './server/adminStats'
import { getNotifications } from './server/notifications'
interface HomeProps {
  stats: any
}

const Home = async ({ stats }: HomeProps) => {
  const users = await getSubscribedUsers()
  const notifications = await getNotifications()

  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeSection />
      <StatsGrid stats={stats} />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SubscribedUsers users={users || []} />
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <SystemHealth />
            {/* <TaskList /> */}
          </div>
          <RecentPosts />
        </div>
        <div className="space-y-6">
          <QuickAccess />
          <NotificationsCenter notifications={notifications || []} />
          <TeamActivity />
        </div>
      </div>
    </div>
  )
}

export default Home
