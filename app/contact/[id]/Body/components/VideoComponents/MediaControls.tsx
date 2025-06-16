import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    SkipBack, 
    SkipForward,
    Maximize
} from 'lucide-react'

interface MediaControlsProps {
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isMuted: boolean
    isFullscreen: boolean
    onPlay: () => void
    onPause: () => void
    onSeek: (time: number) => void
    onVolumeChange: (volume: number) => void
    onMute: () => void
    onFullscreen: () => void
    onSeekForward: () => void
    onSeekBackward: () => void
    className?: string
    size?: 'default' | 'large'
}

const MediaControls: React.FC<MediaControlsProps> = ({
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    onPlay,
    onPause,
    onSeek,
    onVolumeChange,
    onMute,
    onFullscreen,
    onSeekForward,
    onSeekBackward,
    className = '',
    size = 'default'
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const iconSize = size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
    const buttonSize = size === 'large' ? 'default' : 'sm'
    const padding = size === 'large' ? 'p-4' : 'p-3'
    const textSize = size === 'large' ? 'text-sm' : 'text-xs'

    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${className}`}>
            <div className={`${padding} space-y-3`}>
                <div className="flex items-center space-x-3">
                    <span className={`text-white font-mono ${textSize} min-w-[50px]`}>
                        {formatTime(currentTime)}
                    </span>
                    <Slider
                        value={[currentTime]}
                        max={duration || 0}
                        step={0.1}
                        onValueChange={(value) => onSeek(value[0])}
                        className="flex-1"
                    />
                    <span className={`text-white/70 font-mono ${textSize} min-w-[50px]`}>
                        {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={onSeekBackward}
                            variant="ghost"
                            size={buttonSize}
                            className="text-white hover:text-white hover:bg-white/20"
                        >
                            <SkipBack className={iconSize} />
                        </Button>

                        <Button
                            onClick={isPlaying ? onPause : onPlay}
                            variant="ghost"
                            size={buttonSize}
                            className="text-white hover:text-white hover:bg-white/20"
                        >
                            {isPlaying ? (
                                <Pause className={iconSize} />
                            ) : (
                                <Play className={`${iconSize} ml-0.5`} />
                            )}
                        </Button>

                        <Button
                            onClick={onSeekForward}
                            variant="ghost"
                            size={buttonSize}
                            className="text-white hover:text-white hover:bg-white/20"
                        >
                            <SkipForward className={iconSize} />
                        </Button>

                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={onMute}
                                variant="ghost"
                                size={buttonSize}
                                className="text-white hover:text-white hover:bg-white/20"
                            >
                                {isMuted ? (
                                    <VolumeX className={iconSize} />
                                ) : (
                                    <Volume2 className={iconSize} />
                                )}
                            </Button>

                            <div className={`${size === 'large' ? 'w-32' : 'w-20'}`}>
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.1}
                                    onValueChange={(value) => onVolumeChange(value[0])}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onFullscreen}
                        variant="ghost"
                        size={buttonSize}
                        className="text-white hover:text-white hover:bg-white/20"
                    >
                        <Maximize className={iconSize} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MediaControls 