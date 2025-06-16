import React from 'react'
import { Server, Cpu, HardDrive, Network } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const healthMetrics = [
  {
    title: "CPU Usage",
    value: 42,
    icon: Cpu,
    color: "text-blue-500",
    status: "Normal"
  },
  {
    title: "Memory Usage",
    value: 68,
    icon: HardDrive,
    color: "text-yellow-500",
    status: "Warning"
  },
  {
    title: "Network Load",
    value: 25,
    icon: Network,
    color: "text-green-500",
    status: "Normal"
  },
  {
    title: "Server Status",
    value: 100,
    icon: Server,
    color: "text-green-500",
    status: "Healthy"
  }
]

const SystemHealth = () => {
  return (
    <Card className='bg-card/60 backdrop-blur-2xl'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <span className={`text-xs ${
                  metric.status === "Normal" ? "text-green-500" :
                  metric.status === "Warning" ? "text-yellow-500" :
                  "text-red-500"
                }`}>
                  {metric.status}
                </span>
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

export default SystemHealth 