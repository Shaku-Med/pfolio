import React from 'react'
import { Users, GitBranch, Code, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const teamActivities = [
  {
    id: 1,
    user: {
      name: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/150?img=1",
      role: "Frontend Developer"
    },
    action: "pushed",
    target: "feature/user-authentication",
    time: "5 minutes ago",
    icon: GitBranch,
    color: "text-blue-500"
  },
  {
    id: 2,
    user: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=2",
      role: "Backend Developer"
    },
    action: "commented",
    target: "API Documentation",
    time: "1 hour ago",
    icon: MessageSquare,
    color: "text-green-500"
  },
  {
    id: 3,
    user: {
      name: "Emma Davis",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "UI Designer"
    },
    action: "updated",
    target: "Dashboard Design",
    time: "2 hours ago",
    icon: Code,
    color: "text-purple-500"
  }
]

const TeamActivity = () => {
  return (
    <Card className='bg-card/60 backdrop-blur-2xl'>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Activity
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            View Team
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {teamActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-sm text-muted-foreground">{activity.user.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  <span>{activity.action}</span>
                  <span className="font-medium">{activity.target}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TeamActivity 