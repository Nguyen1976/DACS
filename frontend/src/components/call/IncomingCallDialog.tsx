import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, PhoneOff, Video } from 'lucide-react'
import { selectCall } from '@/redux/slices/callSlice'
import { acceptCall, rejectCall } from '@/redux/slices/callSlice'
import type { AppDispatch } from '@/redux/store'

export const IncomingCallDialog = () => {
  const dispatch = useDispatch<AppDispatch>()
  const callState = useSelector(selectCall)

  const isIncoming = callState.status === 'incoming'
  const caller = callState.caller

  const handleAccept = () => {
    if (callState.callId && callState.roomId) {
      dispatch(
        acceptCall({
          callId: callState.callId,
          roomId: callState.roomId,
        }),
      )
    }
  }

  const handleReject = () => {
    if (callState.callId && callState.roomId) {
      dispatch(
        rejectCall({
          callId: callState.callId,
          roomId: callState.roomId,
        }),
      )
    }
  }

  if (!isIncoming || !caller) return null

  return (
    <Dialog open={isIncoming}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center text-xl">
          {callState.mediaType === 'VIDEO' ? 'Incoming Video Call' : 'Incoming Audio Call'}
        </DialogTitle>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            {caller.userAvatar ? (
              <img
                src={caller.userAvatar}
                alt={caller.username}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                <span className="text-2xl font-semibold text-gray-600">
                  {caller.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <p className="text-lg font-semibold">{caller.username}</p>
            <p className="text-sm text-gray-500">is calling you...</p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleReject}
              variant="destructive"
              size="lg"
              className="flex items-center gap-2 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              variant="default"
              size="lg"
              className="flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700"
            >
              {callState.mediaType === 'VIDEO' ? (
                <>
                  <Video className="h-5 w-5" />
                  Accept
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
