import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Shield } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const metrics = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    icon: Users,
    color: "text-blue-500",
    variant: "default"
  },
  {
    title: "Active Sessions",
    value: "1,234",
    change: "+8.2%",
    icon: Activity,
    color: "text-green-500",
    variant: "default"
  },
  {
    title: "System Load",
    value: "42%",
    change: "-2.1%",
    icon: TrendingUp,
    color: "text-yellow-500",
    variant: "destructive"
  },
  {
    title: "Security Score",
    value: "98%",
    change: "+0.5%",
    icon: Shield,
    color: "text-purple-500",
    variant: "default"
  }
]

const MetricsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center pt-1">
              <Badge variant={metric.variant as "default" | "destructive"} className="text-xs">
                {metric.change}
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default MetricsCards 