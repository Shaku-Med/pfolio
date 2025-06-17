import { getGallery } from '@/app/about/page'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import React from 'react'
import GalleryPreview from './components/GalleryPreview'

interface EditPageProps {
    params: Promise<{id: string}>
}

const page = async ({ params }: EditPageProps) => {
  try {
    let {id} = await params
    let galleryImage = await getGallery(1, ['*'], {}, [id])
    if(!galleryImage || galleryImage.length < 1) return <ErrorCard title="Failed to Load" message="This gallery does not exist." />

    let gallery = galleryImage[0]

    // Gallery Other Items
    const itemsPerPage = 12
    const from = 0
    const to = from + itemsPerPage - 1
  
    const initialItems = await getGallery(itemsPerPage, ['*'], { from, to })

    let combinedItems = [gallery]
    if(initialItems.length > 0) {
        combinedItems = [...combinedItems, ...initialItems.filter((item) => item?.id !== gallery?.id)]
    }

    return (
        <>
            <GalleryPreview gallery={combinedItems} />
        </>
    )

  }
  catch {
    return <ErrorCard title="Failed to Load" message="Gallery data is missing or invalid." />
  }
}

export default page
