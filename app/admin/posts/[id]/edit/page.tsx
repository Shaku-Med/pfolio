import { getPost } from '@/app/about/page'
import React from 'react'
import { NewPostForm } from '../../new/components/NewPostForm'
import { ErrorCard, Post } from '../page'

const page = async ({params}: {params: Promise<{id: string}>}) => {
    let {id} = await params
    let posts = await getPost(1, ['*'], {}, [id])
    const post = posts?.[0] as unknown as Post | undefined

    if(!post) {
        return (
            <ErrorCard title="404" message="The post you're looking for doesn't exist or has been removed." />
        )
    }

    return (
        <>
           <div className='py-4'>
            <NewPostForm data={post}/>
           </div>
        </>
    )
}

export default page
