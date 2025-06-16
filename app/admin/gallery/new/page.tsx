import React from 'react'
import { GalleryForm } from '@/app/admin/gallery/new/components/GalleryForm'

const Page = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Gallery Post</h1>
        <GalleryForm />
      </div>
    </div>
  )
}

export default Page
