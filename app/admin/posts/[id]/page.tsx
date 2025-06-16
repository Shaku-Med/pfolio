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
import { format } from 'date-fns'
import Style from './components/Style'
import SinglePagePost from './components/ShowPost/SinglePagePost'
import { GenerateToken } from './components/GenerateToken'

export interface Post {
    id: string;
    text: string;
    location: string;
    post_file: any[];
    description: string;
    long_description?: string;
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    views: number;
    created_at: string;
    updated_at: string;
    author?: {
      name: string;
      avatar?: string;
    };
    user_id?: string;
    post_likes?: {
      user_id: string;
    }[];
  }

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMMM dd, yyyy • h:mm a')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Unknown date'
  }
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const ErrorCard = ({ title, message }: { title: string; message: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center border-destructive/20">
        <CardContent className="pt-12 pb-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">{title}</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">{message}</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/posts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

const PostPage = async ({ params }: { params: { id: string } }) => {
  try {
    const postId = params?.id
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