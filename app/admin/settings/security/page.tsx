'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const SecurityPage = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">Manage your account security preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please contact your administrator to change your password.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">Windows • Chrome • IP: 192.168.1.1</p>
              </div>
              <Button variant="destructive" size="sm">End Session</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mobile Session</p>
                <p className="text-sm text-muted-foreground">iOS • Safari • IP: 192.168.1.2</p>
              </div>
              <Button variant="destructive" size="sm">End Session</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Successful Login</p>
                <p className="text-sm text-muted-foreground">Today at 10:30 AM • Windows • Chrome</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Failed Login Attempt</p>
                <p className="text-sm text-muted-foreground">Yesterday at 8:15 PM • Windows • Firefox</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityPage
