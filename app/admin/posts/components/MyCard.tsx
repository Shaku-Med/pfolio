'use client'
import React from 'react'
import { Post } from '../[id]/page'
import ImageCard from '@/components/ui/ImageCard'
import { Admin } from '@/app/contact/[id]/context/types'

const MyCard = ({post, adminData}: {post: Post[], adminData: Admin}) => {
  return (
    <>
     <div className={`flex items-center justify-center gap-4 flex-col py-10`}>
            {
                post?.map((post: Post, index: number) => {
                    return (
                        <ImageCard
                            key={index}
                            type={`image`}
                            post={post}
                            admin={adminData}
                            routeURL={`/admin/posts`}
                        />
                    )
                })
            }
     </div>
    </>
  )
}

export default MyCard
