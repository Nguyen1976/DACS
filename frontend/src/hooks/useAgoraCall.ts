import { useEffect, useRef, useState, useCallback } from 'react'
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'

AgoraRTC.setLogLevel(4) // Set to ERROR level in production

export interface UseAgoraCallOptions {
  appId: string
  channelName: string
  token: string
  userId: string
  onUserJoined?: (user: IAgoraRTCRemoteUser) => void
  onUserLeft?: (user: IAgoraRTCRemoteUser) => void
  onError?: (error: Error) => void
}

export const useAgoraCall = (options: UseAgoraCallOptions | null) => {
  const [client] = useState<IAgoraRTCClient | null>(() =>
    options ? AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }) : null,
  )
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const isCleaningUp = useRef(false)

  // Join channel
  const joinChannel = useCallback(async () => {
    if (!client || !options || isJoined) return

    try {
      await client.join(options.appId, options.channelName, options.token, options.userId)
      setIsJoined(true)
    } catch (error) {
      console.error('Failed to join channel:', error)
      options.onError?.(error as Error)
      throw error
    }
  }, [client, options, isJoined])

  // Create and publish local tracks
  const createLocalTracks = useCallback(
    async (audioEnabled = true, videoEnabled = true) => {
      if (!client || isPublishing) return

      try {
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
          audioEnabled ? undefined : undefined,
          videoEnabled ? undefined : undefined,
        )

        if (audioEnabled && tracks[0]) {
          setLocalAudioTrack(tracks[0])
        }
        if (videoEnabled && tracks[1]) {
          setLocalVideoTrack(tracks[1])
        }

        if (isJoined && tracks.length > 0) {
          await client.publish(tracks.filter((t) => t))
          setIsPublishing(true)
        }

        return tracks
      } catch (error) {
        console.error('Failed to create local tracks:', error)
        options?.onError?.(error as Error)
        throw error
      }
    },
    [client, isJoined, isPublishing, options],
  )

  // Leave channel and cleanup
  const leaveChannel = useCallback(async () => {
    if (isCleaningUp.current) return
    isCleaningUp.current = true

    try {
      // Close local tracks
      if (localAudioTrack) {
        localAudioTrack.close()
        setLocalAudioTrack(null)
      }
      if (localVideoTrack) {
        localVideoTrack.close()
        setLocalVideoTrack(null)
      }

      // Leave channel
      if (client && isJoined) {
        await client.leave()
        setIsJoined(false)
      }

      setIsPublishing(false)
      setRemoteUsers([])
    } catch (error) {
      console.error('Failed to leave channel:', error)
    } finally {
      isCleaningUp.current = false
    }
  }, [client, isJoined, localAudioTrack, localVideoTrack])

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled)
    }
  }, [localAudioTrack])

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled)
    }
  }, [localVideoTrack])

  // Subscribe to remote user events
  useEffect(() => {
    if (!client || !options) return

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType)
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid)
        if (exists) return prev
        return [...prev, user]
      })
    }

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      // User might still have other tracks published
    }

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid)
        if (exists) return prev
        return [...prev, user]
      })
      options.onUserJoined?.(user)
    }

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
      options.onUserLeft?.(user)
    }

    client.on('user-published', handleUserPublished)
    client.on('user-unpublished', handleUserUnpublished)
    client.on('user-joined', handleUserJoined)
    client.on('user-left', handleUserLeft)

    return () => {
      client.off('user-published', handleUserPublished)
      client.off('user-unpublished', handleUserUnpublished)
      client.off('user-joined', handleUserJoined)
      client.off('user-left', handleUserLeft)
    }
  }, [client, options])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveChannel()
    }
  }, [leaveChannel])

  return {
    client,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isJoined,
    joinChannel,
    leaveChannel,
    createLocalTracks,
    toggleAudio,
    toggleVideo,
  }
}
