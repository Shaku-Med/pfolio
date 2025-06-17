import React from 'react'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import { getGallery } from '@/app/about/components/GetInfos'
import { GalleryForm } from '../../new/components/GalleryForm'

interface EditPageProps {
   params: Promise<{id: string}>
}

const page = async ({ params }: EditPageProps) => {
 try {
    let {id} = await params
    let galleryImage = await getGallery(1, ['*'], {}, [id])
    if(!galleryImage || galleryImage.length < 1) return <ErrorCard title="Failed to Load" message="This gallery does not exist." />

    let gallery = galleryImage[0]

    return (
        <>
        <div className='flex items-center justify-between w-full py-10'>
            <div className='flex flex-col gap-4 container lg:px-10 px-4'>
                <GalleryForm data={gallery}/>
            </div>
        </div>
        </>
    )
 }
 catch  {
    return <ErrorCard title="Failed to Load" message="Gallery data is missing or invalid." />
 }
}

export default page
