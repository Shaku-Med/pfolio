import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    Settings,
    Loader2,
    Music,
    Radio,
    Headphones,
    SkipBack,
    SkipForward,
    Minimize,
    AlertCircle
} from 'lucide-react'
import { Message as MessageType } from '@/app/contact/[id]/context/types'
import MediaSessionHandler from '../VideoComponents/MediaSessionHandler'
import MediaControls from '../VideoComponents/MediaControls'

let currentlyPlayingVideo: HTMLVideoElement | null = null

interface HlsPlayerProps {
    message?: MessageType
    src?: string
    autoPlay?: boolean
    controls?: boolean
    width?: number | string
    height?: number | string
    className?: string
    isAudio?: boolean
    poster?: string
    endpoint?: string
    post?: any
}

interface QualityLevel {
    height: number
    width: number
    bitrate: number
    index: number
}

const HlsPlayer = ({ 
    message, 
    src, 
    autoPlay = false, 
    controls = true,
    width = '100%',
    height = 'auto',
    className = '',
    isAudio = false,
    poster = '',
    endpoint = `/api/chat/messages/file/`,
    post = null
}: HlsPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<any>(null)
    
    // Player State
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
    const [currentQuality, setCurrentQuality] = useState(-1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showControls, setShowControls] = useState(true)
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [audioVisualization, setAudioVisualization] = useState<number[]>([])
    const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0)
    const [wasPlaying, setWasPlaying] = useState(false)

    // Generate media URL
    const baseUrl = message?.file_object?.url?.[0]?.[message?.file_object?.url[0]?.length - 1] || src
    const mediaUrl = baseUrl ? `${endpoint}?url=${encodeURIComponent(baseUrl)}&id=${message?.user_id}` : ''

    // Audio visualization effect
    useEffect(() => {
        if (isAudio && isPlaying) {
            const interval = setInterval(() => {
                setAudioVisualization(Array.from({ length: 5 }, () => Math.random() * 100))
            }, 200)
            return () => clearInterval(interval)
        } else {
            setAudioVisualization([20, 40, 60, 30, 50])
        }
    }, [isAudio, isPlaying])

    // Intersection Observer for auto-pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const wasInView = isInView
                    const isNowInView = entry.isIntersecting
                    setIsInView(isNowInView)

                    const media = isAudio ? audioRef.current : videoRef.current
                    if (!media) return

                    if (!isNowInView) {
                        // Going out of view
                        if (!media.paused) {
                            setWasPlaying(true)
                            setLastPlaybackPosition(media.currentTime)
                            media.pause()
                        }
                    } else if (wasInView !== isNowInView) {
                        // Coming into view
                        media.currentTime = lastPlaybackPosition
                        if (wasPlaying) {
                            media.play().catch(console.error)
                        }
                    }
                })
            },
            { 
                threshold: 0.5,
                rootMargin: '0px'
            }
        )

        const container = containerRef.current
        if (container) {
            observer.observe(container)
        }

        return () => {
            if (container) {
                observer.unobserve(container)
            }
        }
    }, [isAudio, wasPlaying, lastPlaybackPosition])

    // Update lastPlaybackPosition and wasPlaying state when time updates
    useEffect(() => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return

        const updateStates = () => {
            if (isInView) {
                setLastPlaybackPosition(media.currentTime)
                setWasPlaying(!media.paused)
            }
        }

        media.addEventListener('timeupdate', updateStates)
        media.addEventListener('play', () => setWasPlaying(true))
        media.addEventListener('pause', () => setWasPlaying(false))

        return () => {
            media.removeEventListener('timeupdate', updateStates)
            media.removeEventListener('play', () => setWasPlaying(true))
            media.removeEventListener('pause', () => setWasPlaying(false))
        }
    }, [isAudio, isInView])

    // Force pause when out of view
    useEffect(() => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return

        if (!isInView && !media.paused) {
            media.pause()
        }
    }, [isInView, isAudio])

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Controls visibility handler
    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeout) {
            clearTimeout(controlsTimeout)
        }
        const timeout = setTimeout(() => {
            if (isPlaying && !isAudio) {
                setShowControls(false)
            }
        }, 3000)
        setControlsTimeout(timeout)
    }

    // HLS initialization
    useEffect(() => {
        const loadHls = async () => {
            if (!mediaUrl) {
                setError('No media URL provided')
                setIsLoading(false)
                return
            }

            const mediaElement = isAudio ? audioRef.current : videoRef.current
            if (!mediaElement) return

            try {
                const Hls = (await import('hls.js')).default

                if (Hls.isSupported()) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90,
                        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                            try {
                                if (url.includes('.ts') && baseUrl) {
                                    const urlParts = url.split('/')
                                    const filename = urlParts[urlParts.length - 1]
                                    
                                    const baseUrlParts = baseUrl.split('/')
                                    baseUrlParts.pop()
                                    const directoryPath = baseUrlParts.join('/') + '/' + filename
                                    
                                    const proxiedUrl = `${endpoint}?url=${encodeURIComponent(directoryPath)}&id=${message?.user_id}`
                                    xhr.open('GET', proxiedUrl, true)
                                }
                            } catch (error) {
                                console.error('XHR setup error:', error)
                            }
                        }
                    })

                    hlsRef.current = hls
                    hls.loadSource(mediaUrl)
                    hls.attachMedia(mediaElement)

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        setIsLoading(false)
                        setError(null)
                        
                        if (!isAudio) {
                            const levels = hls.levels.map((level, index) => ({
                                height: level.height,
                                width: level.width,
                                bitrate: level.bitrate,
                                index
                            }))
                            setQualityLevels(levels)
                            setCurrentQuality(hls.currentLevel)
                        }
                        
                        if (autoPlay && isInView) {
                            mediaElement.play().catch(console.error)
                        }
                    })

                    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                        setCurrentQuality(data.level)
                    })

                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error('HLS Error:', data)
                        if (data.fatal) {
                            setError(`Playback failed: ${data.details}`)
                            setIsLoading(false)
                        }
                    })

                } else if (mediaElement.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari)
                    mediaElement.src = mediaUrl
                    setIsLoading(false)
                    setError(null)
                } else {
                    setError('HLS playback is not supported in this browser')
                    setIsLoading(false)
                }
            } catch (err) {
                console.error('Failed to load HLS:', err)
                setError('Failed to initialize media player')
                setIsLoading(false)
            }
        }

        loadHls()

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            if (controlsTimeout) {
                clearTimeout(controlsTimeout)
            }
        }
    }, [mediaUrl, autoPlay, isAudio, baseUrl, endpoint, message?.user_id])

    // Media event listeners
    useEffect(() => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return

        const updateTime = () => setCurrentTime(media.currentTime)
        const updateDuration = () => {
            if (media.duration && !isNaN(media.duration)) {
                setDuration(media.duration)
            }
        }
        const updatePlayState = () => setIsPlaying(!media.paused)
        const handleLoadStart = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)
        const handleError = () => {
            setError('Media playback error')
            setIsLoading(false)
        }

        media.addEventListener('timeupdate', updateTime)
        media.addEventListener('loadedmetadata', updateDuration)
        media.addEventListener('durationchange', updateDuration)
        media.addEventListener('play', updatePlayState)
        media.addEventListener('pause', updatePlayState)
        media.addEventListener('loadstart', handleLoadStart)
        media.addEventListener('canplay', handleCanPlay)
        media.addEventListener('error', handleError)

        return () => {
            media.removeEventListener('timeupdate', updateTime)
            media.removeEventListener('loadedmetadata', updateDuration)
            media.removeEventListener('durationchange', updateDuration)
            media.removeEventListener('play', updatePlayState)
            media.removeEventListener('pause', updatePlayState)
            media.removeEventListener('loadstart', handleLoadStart)
            media.removeEventListener('canplay', handleCanPlay)
            media.removeEventListener('error', handleError)
        }
    }, [isAudio])

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('mozfullscreenchange', handleFullscreenChange)
        document.addEventListener('MSFullscreenChange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
        }
    }, [])

    // Player controls
    const togglePlay = () => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return
        
        if (isPlaying) {
            media.pause()
            if (currentlyPlayingVideo === media) {
                currentlyPlayingVideo = null
            }
        } else {
            if (currentlyPlayingVideo && currentlyPlayingVideo !== media) {
                currentlyPlayingVideo.pause()
            }
            media.play().catch(console.error)
            if (!isAudio) {
                currentlyPlayingVideo = media as HTMLVideoElement
            }
        }
    }

    const handleSeek = (time: number) => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media || !duration) return
        
        const seekTime = Math.max(0, Math.min(time, duration))
        media.currentTime = seekTime
        setCurrentTime(seekTime)
    }

    const handleVolumeChange = (newVolume: number) => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return
        
        const clampedVolume = Math.max(0, Math.min(1, newVolume))
        media.volume = clampedVolume
        setVolume(clampedVolume)
        setIsMuted(clampedVolume === 0)
    }

    const toggleMute = () => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return
        
        if (isMuted) {
            media.volume = volume > 0 ? volume : 0.5
            setIsMuted(false)
        } else {
            media.volume = 0
            setIsMuted(true)
        }
    }

    const toggleFullscreen = () => {
        if (isAudio) return
        
        const element = containerRef.current
        if (!element) return

        if (!isFullscreen) {
            const requestFullscreen = element.requestFullscreen || 
                (element as any).webkitRequestFullscreen || 
                (element as any).mozRequestFullScreen || 
                (element as any).msRequestFullscreen

            if (requestFullscreen) {
                requestFullscreen.call(element).catch(console.error)
            }
        } else {
            const exitFullscreen = document.exitFullscreen || 
                (document as any).webkitExitFullscreen || 
                (document as any).mozCancelFullScreen || 
                (document as any).msExitFullscreen

            if (exitFullscreen) {
                exitFullscreen.call(document).catch(console.error)
            }
        }
    }

    const handleSeekForward = () => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return
        const newTime = Math.min(media.currentTime + 10, duration)
        handleSeek(newTime)
    }

    const handleSeekBackward = () => {
        const media = isAudio ? audioRef.current : videoRef.current
        if (!media) return
        const newTime = Math.max(media.currentTime - 10, 0)
        handleSeek(newTime)
    }

    const changeQuality = (value: string) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = parseInt(value)
        }
    }

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Error state
    if (error) {
        return (
            <Card className={`bg-destructive/10 border-destructive/50 ${className}`} style={{ width, height }}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center space-y-3">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                        <div className="text-destructive font-medium">Playback Error</div>
                        <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setError(null)
                                setIsLoading(true)
                            }}
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Audio Player UI
    if (isAudio) {
        return (
            <Card 
                ref={containerRef}
                className={`rounded-none flex items-center justify-center border-none relative  w-full h-full px-4 bg-transparent ${className}`} 
                style={{ width }}
            >
                <div className="h-full w-full flex items-end justify-center">
                    <audio
                        ref={audioRef}
                        preload="metadata"
                        controls
                        className="w-full max-w-[400px] "
                        autoPlay={autoPlay}
                    />
                </div>
                
                {post && (
                    <MediaSessionHandler
                        post={post}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        poster={poster}
                        onPlay={togglePlay}
                        onPause={togglePlay}
                        onSeek={handleSeek}
                        onSeekForward={handleSeekForward}
                        onSeekBackward={handleSeekBackward}
                    />
                )}
            </Card>
        )
    }

    // Video Player UI
    return (
        <div 
            ref={containerRef}
            className={`relative bg-black overflow-hidden ${className}`} 
            style={{ width, height }}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay={autoPlay}
                playsInline
                preload="metadata"
                controls
                poster={poster}
            />
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                        <p className="text-white/80 text-sm">Loading video...</p>
                    </div>
                </div>
            )}

            {post && (
                <MediaSessionHandler
                    post={post}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    poster={poster}
                    onPlay={togglePlay}
                    onPause={togglePlay}
                    onSeek={handleSeek}
                    onSeekForward={handleSeekForward}
                    onSeekBackward={handleSeekBackward}
                />
            )}
        </div>
    )
}

export default HlsPlayer