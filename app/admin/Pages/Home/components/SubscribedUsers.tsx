'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SubscribedUser {
  ip: string
  device_id: string
  email: string
  created_at: string
  active: boolean
}

interface SubscribedUsersProps {
  users: SubscribedUser[]
  isLoading?: boolean
}

const SubscribedUsers = ({ users, isLoading = false }: SubscribedUsersProps) => {
  const router = useRouter()

  const handleRowClick = (deviceId: string) => {
    router.push(`/admin/subscribed/${deviceId}`)
  }

  return (
    <Card className="lg:col-span-2 bg-card/60 backdrop-blur-2xl">
      <CardHeader>
        <CardTitle>Subscribed Users</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-lg font-medium text-muted-foreground">No subscribed users found</p>
            <p className="text-sm text-muted-foreground mt-1">Users will appear here once they subscribe</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow 
                  key={index}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleRowClick(user.device_id)}
                >
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.ip}</TableCell>
                  <TableCell className="font-medium">{user.device_id}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default SubscribedUsers 