import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, PieChart } from 'lucide-react'

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            User Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart visualization will be implemented here
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg bg-card/60 backdrop-blur-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart visualization will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChartsSection 