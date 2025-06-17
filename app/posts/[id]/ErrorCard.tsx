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