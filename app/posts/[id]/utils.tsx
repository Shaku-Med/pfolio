import { format } from 'date-fns'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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