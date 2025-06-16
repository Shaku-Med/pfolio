import React from 'react'
import { FileText, Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const posts = [
  {
    id: 1,
    title: "Getting Started with Next.js 14",
    category: "Development",
    author: "John Doe",
    date: "2 hours ago",
    views: 1234,
    likes: 89,
    comments: 23,
    image: "https://picsum.photos/seed/post1/400/200"
  },
  {
    id: 2,
    title: "Best Practices for React Performance",
    category: "Performance",
    author: "Jane Smith",
    date: "5 hours ago",
    views: 856,
    likes: 67,
    comments: 15,
    image: "https://picsum.photos/seed/post2/400/200"
  },
  {
    id: 3,
    title: "Understanding TypeScript Generics",
    category: "TypeScript",
    author: "Mike Johnson",
    date: "1 day ago",
    views: 2345,
    likes: 156,
    comments: 42,
    image: "https://picsum.photos/seed/post3/400/200"
  }
]

const RecentPosts = () => {
  return (
    <Card className='bg-card/60 backdrop-blur-2xl'>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Posts
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="group">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                  <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>
                  <p className="text-sm text-white/80">By {post.author} • {post.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentPosts 