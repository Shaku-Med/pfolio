import React from 'react'
import { Users, Activity, TrendingUp, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatsGridProps {
  stats?: {
    users?: {
      total?: number
      percentage_change?: number
    }
    active_sessions?: {
      total?: number
      percentage_change?: number
    }
    system_load?: {
      total?: number
      percentage_change?: number
    }
    security_score?: {
      score?: number
      percentage_change?: number
    }
  }
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  const statItems = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      change: `${stats?.users?.percentage_change || 0}%`,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Sessions",
      value: stats?.active_sessions?.total || 0,
      change: `${stats?.active_sessions?.percentage_change || 0}%`,
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "System Load",
      value: `${stats?.system_load?.total || 0}%`,
      change: `${stats?.system_load?.percentage_change || 0}%`,
      icon: TrendingUp,
      color: "text-orange-500"
    },
    {
      title: "Security Score",
      value: stats?.security_score?.score || 0,
      change: `${stats?.security_score?.percentage_change || 0}%`,
      icon: Shield,
      color: "text-purple-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center pt-1">
              <Badge variant={stat.change.startsWith('-') ? "destructive" : "default"} className="text-xs">
                {stat.change}
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsGrid 