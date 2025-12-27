import { Menu, Plus, UserRoundPlus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useState } from 'react'
import { MakeFriendModal } from '../MakeFriendModal'
import { NewChatModal } from '../NewChatModal'

const MenuCustome = () => {
  const [showNewChat, setShowNewChat] = useState(false)
  const [showMakeFriend, setShowMakeFriend] = useState(false)
  return (
    <>
      {showMakeFriend && (
        <MakeFriendModal onClose={() => setShowMakeFriend(false)} />
      )}

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-fit bg-black-bland' align='start'>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Button
                variant='ghost'
                onClick={() => setShowNewChat(true)}
                className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
              >
                <Plus className='w-5 h-5' />
                <p>New Group</p>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {' '}
              <Button
                variant='ghost'
                onClick={() => setShowMakeFriend(true)}
                className='hover:bg-bg-box-message-incoming text-gray-400 hover:text-text'
              >
                <UserRoundPlus className='w-5 h-5' />
                <p>Add Friend</p>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default MenuCustome
