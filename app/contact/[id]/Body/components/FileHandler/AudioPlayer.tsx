import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Loader2,
    Radio,
    SkipBack,
    SkipForward
} from 'lucide-react'

interface AudioPlayerProps {
    message?: any
    src?: string
    autoPlay?: boolean
    width?: number | string
    className?: string
    title?: string
    artist?: string
}

const AudioPlayer = ({ 
    message, 
    src, 
    autoPlay = false, 
    width = '100%',
    className = '',
    title = 'Audio Stream',
    artist = 'High Quality Audio'
}: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const hlsRef = useRef<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    let baseUrl = message?.file_object?.url[0][message?.file_object?.url[0]?.length - 1]
    const audioUrl = src || `/api/chat/messages/file/?url=${encodeURIComponent(baseUrl)}&id=${message?.user_id}`

    useEffect(() => {
        const loadAudio = async () => {
            if (!audioUrl || !audioRef.current) return

            try {
                if (audioUrl.includes('.m3u8') || audioUrl.includes('hls')) {
                    const Hls = (await import('hls.js')).default

                    if (Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90,
                            xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                                try {
                                    if (url.includes('.ts')) {
                                        const urlParts = url.split('/')
                                        const filename = urlParts[urlParts.length - 1]
                                        
                                        const baseUrlParts = baseUrl.split('/')
                                        baseUrlParts.pop()
                                        const directoryPath = baseUrlParts.join('/') + '/' + filename
                                        
                                        const proxiedUrl = `/api/chat/messages/file/?url=${encodeURIComponent(directoryPath)}&id=${message?.user_id}`

                                        xhr.open('GET', proxiedUrl, true)
                                    }
                                }
                                catch {
                                    setError('Failed to load HLS library')
                                }
                            }
                        })

                        hlsRef.current = hls
                        hls.loadSource(audioUrl)
                        hls.attachMedia(audioRef.current)

                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            setIsLoading(false)
                            if (autoPlay) {
                                audioRef.current?.play()
                            }
                        })

                        hls.on(Hls.Events.ERROR, (event, data) => {
                            if (data.fatal) {
                                setError(`HLS Error: ${data.type} - ${data.details}`)
                                setIsLoading(false)
                            }
                        })
                    } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                        audioRef.current.src = audioUrl
                        setIsLoading(false)
                    } else {
                        setError('HLS is not supported in this browser')
                        setIsLoading(false)
                    }
                } else {
                    audioRef.current.src = audioUrl
                    setIsLoading(false)
                }
            } catch (err) {
                setError('Failed to load audio')
                setIsLoading(false)
            }
        }

        loadAudio()

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
            }
        }
    }, [audioUrl, autoPlay])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const updatePlayState = () => setIsPlaying(!audio.paused)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('play', updatePlayState)
        audio.addEventListener('pause', updatePlayState)
        audio.addEventListener('canplay', () => setIsLoading(false))

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('play', updatePlayState)
            audio.removeEventListener('pause', updatePlayState)
            audio.removeEventListener('canplay', () => setIsLoading(false))
        }
    }, [])

    const togglePlay = () => {
        if (!audioRef.current) return
        
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
    }

    const handleSeek = (value: number[]) => {
        if (!audioRef.current) return
        const newTime = value[0]
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleVolumeChange = (value: number[]) => {
        if (!audioRef.current) return
        const newVolume = value[0]
        audioRef.current.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const toggleMute = () => {
        if (!audioRef.current) return
        
        if (isMuted) {
            audioRef.current.volume = volume
            setIsMuted(false)
        } else {
            audioRef.current.volume = 0
            setIsMuted(true)
        }
    }

    const skipBackward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }

    const skipForward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
    }

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (error) {
        return (
            <div className={`bg-black border-gray-800 flex items-center justify-center text-white p-8 ${className}`} 
                 style={{ width }}>
                <div className="text-center space-y-2">
                    <div className="text-red-400 text-lg font-medium">Audio Error</div>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={` z-[-1] w-full h-full absolute bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden ${className}`} style={{ width }}>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>
            
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full animate-bounce"></div>
                <div className="absolute top-20 right-20 w-20 h-20 bg-pink-500/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-40 left-16 w-24 h-24 bg-cyan-500/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-32 right-12 w-16 h-16 bg-purple-500/30 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <audio autoPlay ref={audioRef} preload="metadata" className="hidden" />
            
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-16 h-16 text-white animate-spin" />
                            <p className="text-white text-lg font-medium">Loading audio...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                                <div className="w-40 h-40 sm:w-56 sm:h-56 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <Radio className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
                                </div>
                            </div>
                            {isPlaying && (
                                <>
                                    <div className="absolute inset-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-white/30 animate-ping"></div>
                                    <div className="absolute inset-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-white/50 animate-pulse"></div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {!isLoading && (
                    <div className="bg-black/40 backdrop-blur-md p-4 sm:p-6 space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-white font-semibold text-lg sm:text-xl">{title}</h3>
                            <p className="text-gray-300 text-sm">{artist}</p>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {formatTime(duration)} total
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-white text-xs font-mono min-w-[35px] text-center">
                                {formatTime(currentTime)}
                            </span>
                            <div className="flex-1">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 0}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />
                            </div>
                            <span className="text-white/70 text-xs font-mono min-w-[35px] text-center">
                                {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                            <Button
                                onClick={skipBackward}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                            >
                                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>

                            <Button
                                onClick={togglePlay}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black hover:bg-gray-200 shadow-xl transition-all duration-200 hover:scale-105"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                                ) : (
                                    <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
                                )}
                            </Button>

                            <Button
                                onClick={skipForward}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                            >
                                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                            <Button
                                onClick={toggleMute}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-4 h-4" />
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                            </Button>

                            <div className="w-24 sm:w-32 flex items-center space-x-2">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className="cursor-pointer flex-1"
                                />
                            </div>
                            
                            <span className="text-white/70 text-xs min-w-[30px]">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AudioPlayer