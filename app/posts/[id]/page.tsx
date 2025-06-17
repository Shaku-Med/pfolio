import React from 'react'
import { getPost } from '@/app/about/page'
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