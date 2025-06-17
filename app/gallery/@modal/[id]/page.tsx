import React from 'react'
import GalleryModal from './components/Modal'
import { Metadata } from 'next'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import { getGallery } from '@/app/about/components/GetInfos'
import { Gallery } from '@/app/admin/projects/page'

interface EditPageProps {
  params: Promise<{
      id: string
  }>
 }
 
 export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  try {
    let {id} = await params
    if(!id) return {}
    let galleryImage = await getGallery(1, ['*'], {}, [id])
    if(!galleryImage || galleryImage.length < 1) return {}
    let gallery: Gallery = galleryImage[0]
    if(!gallery) return {}
 
    const cleanDescription = gallery.description?.replace(/\n+/g, ' ').trim() || `${gallery.title} - Visual showcase by Mohamed Amara`;
    const galleryTags = gallery.tags?.join(', ') || '';
    const mediaType = gallery.isVideo ? 'video' : 'image';

    const baseUrl = gallery?.fileData?.type?.startsWith('image') ? gallery?.fileData && Array.isArray(gallery?.fileData?.url) ? gallery?.fileData?.url[0][0]?.split('_')[0] : '' : ''
    const ImageUrl = gallery?.fileData?.type?.startsWith('image') ? `/api/open/?url=${encodeURIComponent(baseUrl || '')}&id=${gallery?.user_id}&length=${gallery?.fileData?.url?.length}&type=${gallery?.fileData?.type}` : ''

    let ThumbNails = gallery?.fileData?.type?.startsWith('video') ? `${gallery?.fileData && Array.isArray(gallery?.fileData?.url) 
      ? `/api/open/?url=${encodeURIComponent(gallery?.fileData?.thumbnail[0][0]?.split('_').splice(0,2).join('_') || '')}&id=${gallery?.user_id}&length=${gallery?.fileData?.thumbnail[0]?.length}&type=image/png`
      : ''}`
      : `${ImageUrl}`
    
    // Na
    
    return {
      title: {
        absolute: `${gallery.title} - Gallery | Mohamed Amara | Medzy Amara`
      },
      description: cleanDescription.slice(0, 160),
      keywords: [
        `${gallery.title}`,
        'Mohamed Amara gallery',
        'Medzy Amara visuals',
        ...(gallery.tags || []),
        `${mediaType} gallery`,
        'visual showcase',
        'creative work',
        'design portfolio',
        'developer visuals',
        'tech showcase'
      ].filter(Boolean),
      authors: [{ name: 'Mohamed Amara' }],
      creator: 'Mohamed Amara',
      publisher: 'Mohamed Amara',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `${gallery.title} | Mohamed Amara Gallery`,
        description: cleanDescription,
        url: `https://medzyamara.dev/gallery/${id}`,
        siteName: 'Mohamed Amara - Visual Gallery',
        images: ThumbNails ? [
          {
            url: ThumbNails,
            width: 1200,
            height: 630,
            alt: `${gallery.title} - ${cleanDescription}`,
          },
        ] : [
          {
            url: `/Icons/web/OgImages/og-gallery-default.png`,
            width: 1200,
            height: 630,
            alt: `${gallery.title} - Mohamed Amara Gallery`,
          },
        ],
        locale: 'en_US',
        type: gallery.isVideo ? 'video.other' : 'article',
        ...(gallery.isVideo && {
          video: {
            url: ThumbNails,
            type: gallery.fileData?.type || 'video/mp4',
          }
        })
      },
      twitter: {
        card: 'summary_large_image',
        title: `${gallery.title} | Mohamed Amara`,
        description: cleanDescription,
        images: ThumbNails ? [ThumbNails] : ['/Icons/web/OgImages/og-gallery-default.png'],
        creator: '@medzyamara',
        site: '@medzyamara',
      },
      alternates: {
        canonical: `https://medzyamara.dev/gallery/${id}`,
      },
      category: `Gallery ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`,
      classification: 'Gallery',
      other: {
        'profile:first_name': 'Mohamed',
        'profile:last_name': 'Amara',
        'profile:username': 'medzyamara',
        'article:author': 'Mohamed Amara',
        'article:section': 'Gallery',
        'gallery:title': gallery.title,
        'gallery:media_type': mediaType,
        'gallery:file_size': gallery.fileData?.size?.toString(),
        'gallery:file_type': gallery.fileData?.type,
        'gallery:tags': galleryTags,
        'gallery:created': gallery.created_at,
        ...(gallery.updated_at && { 'gallery:updated': gallery.updated_at }),
      }
    }
  }
  catch (e) {
    console.log(e);
    return {
      title: {
        absolute: 'Gallery | Mohamed Amara | Medzy Amara'
      },
      description: 'Explore Mohamed Amara\'s visual gallery featuring creative works, design showcases, and visual representations of projects and ideas.',
      keywords: ['Mohamed Amara gallery', 'visual showcase', 'creative portfolio', 'design gallery', 'developer visuals'],
      openGraph: {
        title: 'Gallery - Mohamed Amara | Visual Showcase',
        description: 'Browse through Mohamed\'s collection of visual works, designs, and creative expressions.',
        url: 'https://medzyamara.dev/gallery',
        siteName: 'Mohamed Amara Gallery',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Gallery - Mohamed Amara | Creative Visuals',
        description: 'Discover visual works and creative expressions from a developer\'s perspective.',
        creator: '@medzyamara',
      },
      alternates: {
        canonical: 'https://medzyamara.dev/gallery',
      }
    }
  }
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
        <GalleryModal gallery={combinedItems}/>
      </>
    )
  }
  catch {
    return <ErrorCard title="Failed to Load" message="This gallery does not exist." />
  }
}

export default page
