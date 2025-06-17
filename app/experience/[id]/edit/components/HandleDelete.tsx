'use server'
import IsAuth from '@/app/admin/Auth/IsAuth'
import db from '@/lib/Database/Supabase/Base'
import React from 'react'

const HandleDelete = async ({id}: {id: string}) => {
 try {
    let isAdmin = await IsAuth(true)
    if(!isAdmin) return null
    if(!db) return null
    const {error} = await db.from('experience').delete().eq('id', id)
    if(error) return null
    return true
 }
 catch {
    return null
 }
}

export default HandleDelete
