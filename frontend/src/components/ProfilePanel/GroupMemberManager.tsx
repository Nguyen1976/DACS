import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, User, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectConversationById } from '@/redux/slices/conversationSlice'
import type { AppDispatch, RootState } from '@/redux/store'
import { getFriends, selectFriend } from '@/redux/slices/friendSlice'

export function GroupMemberManager() {
  const [selectedTab, setSelectedTab] = useState('members')
  const [open, setOpen] = useState(false)
  const conversation = useSelector((state: RootState) =>
    selectConversationById(state, 'some-conversation-id'),
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(getFriends())
  }, [dispatch])
  // Get available friends not already in the group
  const availableFriends = useSelector(selectFriend).filter(
    (friend) => conversation?.members.map((m) => m.userId).indexOf(friend.id) === -1,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size='sm'
          variant='outline'
          className='h-8 gap-1 border-accent/20 hover:bg-accent/10 bg-transparent'
        >
          <Users className='w-4 h-4' />
          Manage
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0 bg-background border-accent/20'>
        <div className='p-4 border-b border-accent/10'>
          <h3 className='text-sm font-semibold text-white'>
            {conversation?.groupName}
          </h3>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2 bg-muted/50 m-3 mb-2'>
            <TabsTrigger
              value='members'
              className='flex items-center gap-2 text-xs'
            >
              <User className='w-3 h-3' />
              Members ({conversation?.members.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value='add'
              className='flex items-center gap-2 text-xs'
            >
              <Plus className='w-3 h-3' />
              Add
            </TabsTrigger>
          </TabsList>

          {/* Members List Tab */}
          <TabsContent value='members' className='m-0 p-3'>
            <ScrollArea className='h-[200px] pr-3'>
              <div className='space-y-2'>
                {conversation?.members.length === 0 ? (
                  <div className='flex items-center justify-center h-40 text-muted-foreground'>
                    No members in this group
                  </div>
                ) : (
                  conversation?.members.map((member) => (
                    <div
                      key={member.userId}
                      className='flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage
                            src={member.avatar || '/placeholder.svg'}
                            alt={member.username || 'User'}
                          />
                          <AvatarFallback>{member.username?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {member.username}
                          </p>
                          {/* <p className='text-xs text-muted-foreground capitalize'>
                            {member.role}
                          </p> */}
                        </div>
                      </div>
                      {/* {member.role === 'member' && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onRemoveMember(member.userId)}
                          className='h-8 w-8 text-muted-foreground hover:text-destructive'
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      )} */}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Add Member Tab */}
          <TabsContent value='add' className='m-0 p-3'>
            <ScrollArea className='h-[200px] pr-3'>
              <div className='space-y-2'>
                {availableFriends.length === 0 ? (
                  <div className='flex items-center justify-center h-40 text-muted-foreground'>
                    All friends are already in this group
                  </div>
                ) : (
                  availableFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className='flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage
                            src={friend.avatar || '/placeholder.svg'}
                            alt={friend.username || 'User'}
                          />
                          <AvatarFallback>{friend.username?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {friend.username}
                          </p>
                          {/* <p className='text-xs text-muted-foreground'>
                            {friend.status}
                          </p> */}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        // onClick={() => onAddMember(friend.id)}
                        className='h-8 w-8 text-muted-foreground hover:text-primary'
                      >
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
