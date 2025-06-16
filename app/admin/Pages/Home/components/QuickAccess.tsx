import React from 'react'
import { Users, BarChart2, Settings, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const quickAccess = [
  {
    title: "User Management",
    description: "Manage user accounts and permissions",
    icon: Users,
    href: "/admin/users"
  },
  {
    title: "Analytics",
    description: "View system analytics and reports",
    icon: BarChart2,
    href: "/admin/analytics"
  },
  {
    title: "System Settings",
    description: "Configure system preferences",
    icon: Settings,
    href: "/admin/settings"
  }
]

const QuickAccess = () => {
  return (
    <Card className='bg-card/60 backdrop-blur-2xl'>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quickAccess.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-4 hover:bg-accent/50 transition-colors"
              asChild
            >
              <Link href={item.href}>
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-accent/50">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickAccess 