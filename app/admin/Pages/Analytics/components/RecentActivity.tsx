import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from 'lucide-react'

const activities = [
  {
    title: "User activity detected",
    time: "2 hours ago"
  },
  {
    title: "System update completed",
    time: "4 hours ago"
  },
  {
    title: "New user registration",
    time: "5 hours ago"
  },
  {
    title: "Security scan completed",
    time: "6 hours ago"
  }
]

const RecentActivity = () => {
  return (
    <Card className="hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity 