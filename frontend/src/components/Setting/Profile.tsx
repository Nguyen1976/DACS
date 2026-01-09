import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '../ui/form'
import { selectUser } from '@/redux/slices/userSlice'
import { useSelector } from 'react-redux'

const formProfileScheme = z.object({
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  bio: z.string(),
})

const Profile = () => {
    const user = useSelector(selectUser)

  const formProfile = useForm<z.infer<typeof formProfileScheme>>({
    resolver: zodResolver(formProfileScheme),
    defaultValues: {
      username: user.username,
      email: user.email || ''
    },
  })
  return (
    <Form {...formProfile}>
      <div>
        <h3 className='text-lg font-semibold mb-4'>Profile Information</h3>

        {/* Avatar Section */}
        <div className='flex items-center gap-6 mb-8 p-4 bg-muted rounded-lg'>
          <Avatar className='w-24 h-24'>
            <AvatarImage
              src={user.avatar || '/placeholder.svg'}
              alt={user.username}
            />
            <AvatarFallback className='text-2xl'>
              {user.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h4 className='font-medium mb-2'>{user.username}</h4>
            <p className='text-sm text-muted-foreground mb-3'>
              Your profile photo
            </p>
            <Button variant='outline' size='sm'>
              Change Photo
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Full Name</label>
            <Input
              placeholder='Enter your full name'
              className='bg-input border-border'
              {...formProfile.register('username')}
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <Input
              type='email'
              placeholder='Enter your email'
              className='bg-input border-border'
              {...formProfile.register('email')}
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>
              Phone Number
            </label>
            <Input
              placeholder='Enter your phone number'
              className='bg-input border-border'
              {...formProfile.register('phone')}
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Bio</label>
            <textarea
              placeholder='Tell us about yourself'
              className='w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none'
              rows={4}
              {...formProfile.register('bio')}
            />
          </div>
        </div>
      </div>
      <div className='border-t border-border p-6 flex items-center justify-between gap-4'>
        <Button variant='destructive' className='gap-2'>
          <LogOut className='w-4 h-4' />
          Log Out
        </Button>
        <Button className='gap-2 bg-primary hover:bg-primary/90'>
          <Save className='w-4 h-4' />
        </Button>
      </div>
    </Form>
  )
}

export default Profile
