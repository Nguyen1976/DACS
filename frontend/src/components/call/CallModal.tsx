import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'
import { selectCall, endCall, toggleLocalAudio, toggleLocalVideo, resetCall } from '@/redux/slices/callSlice'
import { useAgoraCall } from '@/hooks/useAgoraCall'
import type { AppDispatch } from '@/redux/store'
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '98bdf0b44c07441d8a143720963500f2'

export const CallModal = () => {
  const dispatch = useDispatch<AppDispatch>()
  const callState = useSelector(selectCall)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRefs = useRef<Map<string | number, HTMLDivElement>>(new Map())

  const isActive = callState.status === 'connected' || callState.status === 'outgoing'
  const currentParticipant = callState.participants.find((p) => p.isLocalUser)

  const agoraOptions = isActive && callState.roomId && currentParticipant?.token
    ? {
        appId: AGORA_APP_ID,
        channelName: callState.roomId,
        token: currentParticipant.token,
        userId: currentParticipant.userId,
      }
    : null

  const {
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    joinChannel,
    leaveChannel,
    createLocalTracks,
    toggleAudio,
    toggleVideo,
  } = useAgoraCall(agoraOptions)

  // Join channel when call is accepted
  useEffect(() => {
    if (callState.status === 'connected' && agoraOptions) {
      joinChannel().then(() => {
        createLocalTracks(
          true,
          callState.mediaType === 'VIDEO',
        )
      })
    }
  }, [callState.status, agoraOptions])

  // Play local video track
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current)
    }
  }, [localVideoTrack])

  // Play remote video tracks
  useEffect(() => {
    remoteUsers.forEach((user) => {
      const ref = remoteVideoRefs.current.get(user.uid)
      if (ref && user.videoTrack) {
        user.videoTrack.play(ref)
      }
      if (user.audioTrack) {
        user.audioTrack.play()
      }
    })
  }, [remoteUsers])

  const handleEndCall = async () => {
    await leaveChannel()
    if (callState.callId && callState.roomId) {
      dispatch(endCall({
        callId: callState.callId,
        roomId: callState.roomId,
      }))
    }
    dispatch(resetCall())
  }

  const handleToggleAudio = async () => {
    await toggleAudio()
    dispatch(toggleLocalAudio())
  }

  const handleToggleVideo = async () => {
    await toggleVideo()
    dispatch(toggleLocalVideo())
  }

  if (!isActive) return null

  return (
    <Dialog open={isActive}>
      <DialogContent className="sm:max-w-4xl h-[600px]">
        <div className="flex h-full flex-col">
          {/* Video grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4">
            {/* Local video */}
            <div className="relative rounded-lg bg-gray-900 overflow-hidden">
              <div ref={localVideoRef} className="h-full w-full" />
              {callState.localVideoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* Remote videos */}
            {remoteUsers.map((user) => (
              <div key={user.uid} className="relative rounded-lg bg-gray-900 overflow-hidden">
                <div
                  ref={(el) => {
                    if (el) remoteVideoRefs.current.set(user.uid, el)
                  }}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 p-4">
            <Button
              onClick={handleToggleAudio}
              variant={callState.localAudioMuted ? 'destructive' : 'default'}
              size="lg"
              className="rounded-full"
            >
              {callState.localAudioMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            {callState.mediaType === 'VIDEO' && (
              <Button
                onClick={handleToggleVideo}
                variant={callState.localVideoMuted ? 'destructive' : 'default'}
                size="lg"
                className="rounded-full"
              >
                {callState.localVideoMuted ? (
                  <VideoOff className="h-6 w-6" />
                ) : (
                  <Video className="h-6 w-6" />
                )}
              </Button>
            )}

            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
