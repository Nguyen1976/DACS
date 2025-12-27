import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { getFriendRequestDetail, updateFriendRequestStatus } from '@/apis'
import { useSelector } from 'react-redux'
import { selectUser } from '@/redux/slices/userSlice'

interface FriendRequestModalProps {
  friendRequestId: string
  isOpen: boolean
  onClose: () => void
}

const FriendRequestModal = ({
  isOpen,
  friendRequestId,
  onClose,
}: FriendRequestModalProps) => {
  const [inviteeData, setInviteeData] = useState<{
    id: string
    email: string
    username: string
    avatar?: string
  } | null>(null)

  const user = useSelector(selectUser)

  useEffect(() => {
    if (isOpen) {
      getFriendRequestDetail(friendRequestId).then((data) => {
        setInviteeData(data.fromUser)
      })
    }
  }, [isOpen, friendRequestId])

  const onAccept = async () => {
    await updateFriendRequestStatus({
      inviterId: inviteeData?.id || '',
      inviteeName: user?.username || '',
      status: 'ACCEPTED',
    }).then(() => {
      onClose()
    })
  }

  const onReject = async () => {
    await updateFriendRequestStatus({
      inviterId: inviteeData?.id || '',
      inviteeName: user?.username || '',
      status: 'REJECTED',
    }).then(() => {
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center'>Friend Request</DialogTitle>
          <DialogDescription className='text-center'>
            You received a new invitation to connect.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center py-6 gap-4'>
          <Avatar className='w-24 h-24 border-4 border-background shadow-lg'>
            <AvatarImage
              src={inviteeData?.avatar || '/placeholder.svg'}
              alt={inviteeData?.username || 'User Avatar'}
            />
            <AvatarFallback>{inviteeData?.username[0]}</AvatarFallback>
          </Avatar>
          <div className='text-center'>
            <h3 className='text-xl font-bold'>{inviteeData?.username}</h3>
            <p className='text-muted-foreground'>
              {inviteeData?.email ||
                `${inviteeData?.username
                  .toLowerCase()
                  .replace(' ', '.')}@example.com`}
            </p>
          </div>
        </div>
        <DialogFooter className='flex sm:justify-center gap-2'>
          <Button
            variant='outline'
            className='flex-1 sm:flex-none bg-transparent'
            onClick={onReject}
          >
            Reject
          </Button>
          <Button className='flex-1 sm:flex-none' onClick={onAccept}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FriendRequestModal
