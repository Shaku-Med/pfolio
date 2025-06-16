import { Post } from '@/app/admin/posts/[id]/page'
import React, { useEffect } from 'react'

interface MediaSessionHandlerProps {
    post?: Post
    isPlaying: boolean
    currentTime: number
    duration: number
    poster?: string
    onPlay: () => void
    onPause: () => void
    onSeek: (time: number) => void
    onSeekForward: () => void
    onSeekBackward: () => void
    onNextTrack?: () => void
    onPreviousTrack?: () => void
}

const MediaSessionHandler: React.FC<MediaSessionHandlerProps> = ({
    post,
    isPlaying,
    currentTime,
    duration,
    poster,
    onPlay,
    onPause,
    onSeek,
    onSeekForward,
    onSeekBackward,
    onNextTrack,
    onPreviousTrack
}) => {
    useEffect(() => {
        if (!('mediaSession' in navigator)) return

        const updatePositionState = () => {
            if ('setPositionState' in navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: duration,
                    playbackRate: 1,
                    position: currentTime
                })
            }
        }

        const updateMetadata = () => {
            const metadata = new MediaMetadata({
                title: post?.text || 'Media',
                artist: post?.description || `Playing on Mohamed's Portfolio App`,
                album: 'Media Stream',
                artwork: poster ? [
                    { src: poster, sizes: '512x512', type: 'image/jpeg' },
                    { src: poster, sizes: '256x256', type: 'image/jpeg' },
                    { src: poster, sizes: '128x128', type: 'image/jpeg' }
                ] : []
            })

            navigator.mediaSession.metadata = metadata
        }

        const setupMediaSession = () => {
            navigator.mediaSession.setActionHandler('play', onPlay)
            navigator.mediaSession.setActionHandler('pause', onPause)
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined) {
                    onSeek(details.seekTime)
                }
            })
            navigator.mediaSession.setActionHandler('seekforward', onSeekForward)
            navigator.mediaSession.setActionHandler('seekbackward', onSeekBackward)

            if (onNextTrack) {
                navigator.mediaSession.setActionHandler('nexttrack', onNextTrack)
            }
            if (onPreviousTrack) {
                navigator.mediaSession.setActionHandler('previoustrack', onPreviousTrack)
            }

            updateMetadata()
        }

        setupMediaSession()

        const interval = setInterval(updatePositionState, 1000)

        return () => {
            clearInterval(interval)
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null)
                navigator.mediaSession.setActionHandler('pause', null)
                navigator.mediaSession.setActionHandler('seekto', null)
                navigator.mediaSession.setActionHandler('seekforward', null)
                navigator.mediaSession.setActionHandler('seekbackward', null)
                navigator.mediaSession.setActionHandler('nexttrack', null)
                navigator.mediaSession.setActionHandler('previoustrack', null)
            }
        }
    }, [post, isPlaying, currentTime, duration, poster, onPlay, onPause, onSeek, onSeekForward, onSeekBackward, onNextTrack, onPreviousTrack])

    return null
}

export default MediaSessionHandler 