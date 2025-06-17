import React from 'react'
import Users from '../Pages/Users/Users'
import db from '@/lib/Database/Supabase/Base'

async function getUsers(page: number = 1, pageSize: number = 10) {
  try {
    if (!db) {
      console.error('Database connection failed')
      return {
        users: [],
        totalPages: 0,
        totalItems: 0
      }
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: users, error, count } = await db
      .from('chat_users')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return {
        users: [],
        totalPages: 0,
        totalItems: 0
      }
    }

    return {
      users: users || [],
      totalPages: Math.ceil((count || 0) / pageSize),
      totalItems: count || 0
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      users: [],
      totalPages: 0,
      totalItems: 0
    }
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{page?: string}>
}) {
  const {page} = await searchParams
  const currentPage = Number(page) || 1
  const { users, totalPages, totalItems } = await getUsers(currentPage)

  return (
    <>
      <div className='w-full flex flex-col items-center justify-center'>
          <Users 
            users={users} 
            totalPages={totalPages} 
            totalItems={totalItems} 
            currentPage={currentPage} 
          />
      </div>
    
    </>
  )
}
