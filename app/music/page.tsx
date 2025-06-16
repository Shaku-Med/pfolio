'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Music, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  ExternalLink, 
  Play, 
  Pause,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Star,
  Headphones,
  Music2,
  Radio,
  Disc3
} from 'lucide-react'

interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  icon: React.ReactNode
  isActive: boolean
  clicks: number
  isNew?: boolean
  isPremium?: boolean
}

interface SocialLink {
  platform: string
  url: string
  icon: React.ReactNode
  followers: string
  isVerified?: boolean
}

interface Track {
  id: string
  title: string
  artist: string
  duration: string
  plays: string
  isPlaying: boolean
}

const page = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [liked, setLiked] = useState<string[]>([])
  const [profileViews] = useState(12547)
  const [totalClicks] = useState(8932)

  const [links] = useState<LinkItem[]>([
    {
      id: '1',
      title: 'Latest Album - "Midnight Echoes"',
      description: 'Stream my new album on all platforms',
      url: '#',
      icon: <Music2 className="w-5 h-5" />,
      isActive: true,
      clicks: 2341,
      isNew: true,
      isPremium: true
    },
    {
      id: '2',
      title: 'Live Concert Tickets',
      description: 'Get tickets for upcoming tour dates',
      url: '#',
      icon: <Calendar className="w-5 h-5" />,
      isActive: true,
      clicks: 1876,
      isNew: true
    },
    {
      id: '3',
      title: 'Official Merchandise Store',
      description: 'Limited edition hoodies, vinyl records & more',
      url: '#',
      icon: <Star className="w-5 h-5" />,
      isActive: true,
      clicks: 1243
    },
    {
      id: '4',
      title: 'Music Production Course',
      description: 'Learn my production techniques',
      url: '#',
      icon: <Headphones className="w-5 h-5" />,
      isActive: true,
      clicks: 987,
      isPremium: true
    },
    {
      id: '5',
      title: 'Collaboration Inquiries',
      description: 'Work with me on your next project',
      url: '#',
      icon: <Users className="w-5 h-5" />,
      isActive: true,
      clicks: 654
    },
    {
      id: '6',
      title: 'Weekly Podcast - "Sound Stories"',
      description: 'Behind the scenes of music creation',
      url: '#',
      icon: <Radio className="w-5 h-5" />,
      isActive: true,
      clicks: 432
    }
  ])

  const [socialLinks] = useState<SocialLink[]>([
    {
      platform: 'Spotify',
      url: '#',
      icon: <Music className="w-5 h-5" />,
      followers: '2.1M',
      isVerified: true
    },
    {
      platform: 'Instagram',
      url: '#',
      icon: <Instagram className="w-5 h-5" />,
      followers: '847K',
      isVerified: true
    },
    {
      platform: 'YouTube',
      url: '#',
      icon: <Youtube className="w-5 h-5" />,
      followers: '1.3M',
      isVerified: true
    },
    {
      platform: 'Twitter',
      url: '#',
      icon: <Twitter className="w-5 h-5" />,
      followers: '523K'
    }
  ])

  const [featuredTracks] = useState<Track[]>([
    {
      id: '1',
      title: 'Neon Dreams',
      artist: 'Alex Rivers',
      duration: '3:24',
      plays: '8.2M',
      isPlaying: false
    },
    {
      id: '2',
      title: 'City Lights',
      artist: 'Alex Rivers',
      duration: '4:01',
      plays: '6.7M',
      isPlaying: false
    },
    {
      id: '3',
      title: 'Midnight Drive',
      artist: 'Alex Rivers',
      duration: '3:47',
      plays: '12.4M',
      isPlaying: false
    }
  ])

  const togglePlay = (trackId: string) => {
    setCurrentTrack(currentTrack === trackId ? null : trackId)
  }

  const toggleLike = (id: string) => {
    setLiked(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Alex Rivers - Music Producer',
          text: 'Check out my latest music and projects!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{profileViews.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
              <AvatarImage src={`https://image-cdn-ak.spotifycdn.com/image/ab67618600009d8064e9c910aae75c757b887a89`} className='object-cover object-top' />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">MA</AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Medzy Amara</h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              Music Producer
            </Badge>
            <Badge variant="outline">Verified Artist</Badge>
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed">
          Crafting electronic beats that hit different. Always thinking about the next track. Let's make something cool together.
          </p>

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4" />
            <span>Staten Island, NY</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-3">
              <CardContent className="p-0 text-center">
                <div className="text-2xl font-bold text-primary">{totalClicks.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Clicks</div>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardContent className="p-0 text-center">
                <div className="text-2xl font-bold text-primary">300</div>
                <div className="text-xs text-muted-foreground">Monthly Streams</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Featured Tracks</h3>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {featuredTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => togglePlay(track.id)}
                      >
                        {currentTrack === track.id ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{track.title}</div>
                        <div className="text-xs text-muted-foreground">{track.plays} plays</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{track.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
              {currentTrack && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Now Playing</span>
                    <span className="text-xs text-muted-foreground">1:24 / 3:24</span>
                  </div>
                  <Progress value={35} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <Badge variant="secondary" className="text-xs">
              {links.filter(link => link.isActive).length} Active
            </Badge>
          </div>
          
          {links
            .filter(link => link.isActive)
            .map((link) => (
              <Card key={link.id} className="group py-0 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-4 flex items-center justify-between text-left group-hover:bg-muted/50 transition-colors"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{link.title}</span>
                          {link.isNew && (
                            <Badge variant="default" className="text-xs px-2 py-0">New</Badge>
                          )}
                          {link.isPremium && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              <Star className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {link.clicks.toLocaleString()} clicks
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(link.id)
                            }}
                          >
                            <Heart className={`w-3 h-3 ${liked.includes(link.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        <Separator className="my-8" />

        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Connect With Me</h3>
          <div className="grid grid-cols-2 gap-3">
            {socialLinks.map((social) => (
              <Card key={social.platform} className="group py-0 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-4 flex flex-col items-center gap-2 group-hover:bg-muted/50"
                    onClick={() => window.open(social.url, '_blank')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {social.icon}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <span className="font-medium text-sm">{social.platform}</span>
                        {social.isVerified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{social.followers} followers</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Get In Touch</div>
                <div className="text-sm text-muted-foreground">For business inquiries and collaborations</div>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.open('mailto:hello@alexrivers.com', '_blank')}>
              Send Email
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-4">
            <span>© {new Date().getFullYear()} Medzy Amara</span>
            <Separator orientation="vertical" className="h-4" />
          </div>
          <div className="flex items-center justify-center gap-1 text-xs">
            <Disc3 className="w-3 h-3" />
            <span>Yes I make music.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page