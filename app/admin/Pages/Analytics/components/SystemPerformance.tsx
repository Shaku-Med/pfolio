import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

const performanceMetrics = [
  {
    title: "CPU Usage",
    value: 42,
    status: "Normal",
    statusColor: "text-green-500"
  },
  {
    title: "Memory Usage",
    value: 68,
    status: "Warning",
    statusColor: "text-yellow-500"
  },
  {
    title: "Network Load",
    value: 25,
    status: "Normal",
    statusColor: "text-green-500"
  }
]

const SystemPerformance = () => {
  return (
    <Card className="hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.title}</span>
                <span className={`text-xs ${metric.statusColor}`}>{metric.status}</span>
              </div>
              <Progress value={metric.value} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>{metric.value}%</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemPerformance 