import React from 'react'
import { getPost } from '@/app/about/components/GetInfos'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Calendar,
  MapPin,
  Eye,
  ArrowLeft,
  ExternalLink,
  Clock,
  User,
  FileText,
  Hash,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Style from './components/Style'
import SinglePagePost from './components/ShowPost/SinglePagePost'
import { GenerateToken } from './components/GenerateToken'
import HandleViews from '../components/Action/HandleViews'
import { Post, formatDate, formatNumber } from './utils'
import {ErrorCard} from './ErrorCard'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    if(!id) return {}
    const posts = await getPost(1, ['*'], {}, [id])
    const post = posts?.[0] as unknown as Post | undefined
    if(!post) return {}
 
    const cleanDescription = post.text || 'Read Mohamed Amara\'s latest insights on technology, development, and innovation.';
    const postTags = post.tags?.join(', ') || '';
    const hasAudio = post.post_file?.some(file => file.fileType?.startsWith('audio/'));
    const hasVideo = post.post_file?.some(file => file.fileType?.startsWith('video/'));
    const hasImage = post.post_file?.some(file => file.fileType?.startsWith('image/'));
    
    const mediaType = hasVideo ? 'video post' : hasAudio ? 'audio post' : hasImage ? 'image post' : 'text post';

    const baseUrl = post?.post_file[0]?.fileType?.startsWith('image') ? post?.post_file && Array.isArray(post?.post_file[0]?.url) ? post?.post_file[0]?.url[0][0]?.split('_')[0] : '' : ''
    const ImageUrl = post?.post_file[0]?.fileType?.startsWith('image') ? `/api/open/?url=${encodeURIComponent(baseUrl || '')}&id=${post?.user_id}&length=${post?.post_file[0]?.totalChunks}&type=${post?.post_file[0]?.fileType}` : ''

    let ThumbNails = post?.post_file[0]?.fileType?.startsWith('video') ? `${post?.post_file && Array.isArray(post?.post_file[0]?.url) 
      ? `/api/open/?url=${encodeURIComponent(post?.post_file[0]?.thumbnail[0]?.split('_').splice(0,2).join('_') || '')}&id=${post?.user_id}&length=${post?.post_file[0]?.thumbnail?.length}&type=image/png`
      : ''}`
      : `${ImageUrl}`
    
    return {
      title: {
        absolute: `${cleanDescription} - Mohamed Amara | Medzy Amara`
      },
      description: `${cleanDescription} ${post.text ? `- ${post.text.slice(0, 100)}...` : ''}`.slice(0, 160),
      keywords: [
        'Mohamed Amara post',
        'Medzy Amara blog',
        ...(post.tags || []),
        mediaType,
        'tech insights',
        'developer thoughts',
        post.location && `${post.location} developer`,
        'technology blog',
        'software development'
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
        title: `${cleanDescription} | Mohamed Amara`,
        description: `${post.text || cleanDescription} - Latest insights from Mohamed Amara on technology and development.`,
        url: `https://medzyamara.dev/posts/${id}`,
        siteName: 'Mohamed Amara - Developer Blog',
        images: ThumbNails ? [
          {
            url: ThumbNails,
            width: 1200,
            height: 630,
            alt: `${cleanDescription} - Mohamed Amara Post`,
          },
        ] : [
          {
            url: `/Icons/web/OgImages/og-post-default.png`,
            width: 1200,
            height: 630,
            alt: `${cleanDescription} - Mohamed Amara Post`,
          },
        ],
        locale: 'en_US',
        type: 'article',
        authors: ['Mohamed Amara'],
        publishedTime: post.created_at,
        modifiedTime: post.updated_at || post.created_at,
        section: 'Technology',
        tags: post.tags || [],
      },
      twitter: {
        card: hasImage ? 'summary_large_image' : 'summary',
        title: `${cleanDescription} | Mohamed Amara`,
        description: `${post.text || cleanDescription}`.slice(0, 160),
        images: ThumbNails ? [
          ThumbNails
        ] : ['/Icons/web/OgImages/og-post-default.png'],
        creator: '@medzyamara',
        site: '@medzyamara',
      },
      alternates: {
        canonical: `https://medzyamara.dev/posts/${id}`,
      },
      category: 'Technology Blog Post',
      classification: 'Blog Post',
      other: {
        'profile:first_name': 'Mohamed',
        'profile:last_name': 'Amara',
        'profile:username': 'medzyamara',
        'article:author': 'Mohamed Amara',
        'article:section': 'Technology',
        'blog:author': 'Mohamed Amara',
        'post:views': post.views?.toString(),
        'post:likes': post.likes?.toString(),
        'post:comments': post.comments?.toString(),
        'post:shares': post.shares?.toString(),
        'post:tags': postTags,
        'post:location': post.location,
        'post:media_type': mediaType,
        ...(hasAudio && { 'og:type': 'music.song' }),
        ...(hasVideo && { 'og:type': 'video.other' }),
      }
    }
  }
  catch (e) {
    console.log(e)
    return {
      title: {
        absolute: `Post - Mohamed Amara | Medzy Amara`
      },
      description: 'Explore Mohamed Amara\'s latest thoughts on technology, AI development, cybersecurity, and software engineering. Join the conversation on innovation and coding.',
      keywords: ['Mohamed Amara post', 'tech blog', 'developer insights', 'technology thoughts'],
      openGraph: {
        title: 'Post - Mohamed Amara | Tech Insights',
        description: 'Read Mohamed\'s latest perspectives on technology, development, and innovation.',
        url: 'https://medzyamara.dev/posts',
        siteName: 'Mohamed Amara Blog',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'Post - Mohamed Amara | Developer Thoughts',
        description: 'Latest insights from a student developer navigating the tech world.',
        creator: '@medzyamara',
      },
      alternates: {
        canonical: 'https://medzyamara.dev/posts',
      }
    }
  }
 }

const PostPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const postId = id
    if (!postId) {
      throw new Error('Post ID is required')
    }

    const posts = await getPost(1, ['*'], {}, [postId])
    const post = posts?.[0] as unknown as Post | undefined

    if (!post) {
      return (
        <ErrorCard 
          title="404" 
          message="The post you're looking for doesn't exist or has been removed."
        />
      )
    }

    let token = await GenerateToken()
    if(!token) {
      return (
        <ErrorCard
          title="Error"
          message={`Looks like we were unable to get the most important data to load this post. Refresh the page or try again later.`}
        />
      )
    }

    await HandleViews(postId)

    return (
        <>
          <Style/>
          <SinglePagePost posts={post} token={token}/>
        </>
    )
  } catch (error) {
    console.error('Error loading post:', error)
    return (
      <ErrorCard 
        title="Error" 
        message="We encountered an error while loading this post. Please try again later."
      />
    )
  }
}

export default PostPage