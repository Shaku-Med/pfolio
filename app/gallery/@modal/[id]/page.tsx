import React from 'react'
import GalleryModal from './components/Modal'
import { Metadata } from 'next'
import { ErrorCard } from '@/app/posts/[id]/page'
import { getGallery } from '@/app/about/page'

interface EditPageProps {
  params: {
      id: string
  }
}

export const metadata:Metadata = {
  title: {
    absolute: `Picture`
  }
}


const page = async ({ params }: EditPageProps) => {
  try {

    let id = await params.id
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
        <GalleryModal gallery={combinedItems}/>
      </>
    )
  }
  catch {
    return <ErrorCard title="Failed to Load" message="This gallery does not exist." />
  }
}

export default page
