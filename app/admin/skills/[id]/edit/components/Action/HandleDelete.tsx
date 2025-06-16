'use server'
import IsAuth from '@/app/admin/Auth/IsAuth'
import db from '@/lib/Database/Supabase/Base'
import React from 'react'

const HandleDelete = async ({id}: {id: string}) => {
  try {
    let isAdmin = await IsAuth(true)
    if(!isAdmin) return false
    if(!db) return false
    const {error} = await db.from('skills').delete().eq('id', id)

    if(error) throw error
    return true
  }
  catch {
    return false
  }
}

export default HandleDelete
