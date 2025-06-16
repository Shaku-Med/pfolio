'use client'
import React from 'react'
import PageHeader from './components/PageHeader'
import UserGrid from './components/UserGrid'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with your actual data fetching logic
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
  },
  {
    id: "2",
    name: "Jane Smith",
  },
  // Add more mock users as needed
]

interface User {
  id: string
  name: string
  user_id: string
  user_ua: string
  ip: string
  created_at: string
  is_blocked: boolean
}

interface UsersProps {
  users: User[]
  totalPages: number
  totalItems: number
  currentPage: number
}

const Users = ({ users, totalPages, totalItems, currentPage }: UsersProps) => {
  return (
    <div className="space-y-6 p-6">
      <div className="container sm:px-6 px-2">
        <PageHeader />
        <UserGrid users={users} />
        
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {totalItems} users
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
                asChild
              >
                <Link 
                  href={`/admin/users?page=${currentPage - 1}`}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
                asChild
              >
                <Link 
                  href={`/admin/users?page=${currentPage + 1}`}
                  aria-disabled={currentPage === totalPages || totalPages === 0}
                  tabIndex={currentPage === totalPages || totalPages === 0 ? -1 : 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users
