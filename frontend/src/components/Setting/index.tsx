import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Bell, Lock, Shield, X } from 'lucide-react'
import Profile from './Profile'

interface ProfileSettingsProps {
  onClose: () => void
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  
  return (
    <div className='w-full h-full max-w-3xl mx-auto bg-[rgba(0,0,0,0.3)] text-foreground  fixed z-50 '>
      <div className='w-2/3 mx-auto py-6 bg-card rounded-lg border border-border shadow-lg'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <h2 className='text-xl font-semibold'>Settings & Privacy</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='hover:bg-muted'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto max-h-[80vh] custom-scrollbar'>
          <Tabs defaultValue='profile' className='w-full'>
            <TabsList className='w-full justify-start rounded-none border-b border-border bg-transparent p-0'>
              <TabsTrigger
                value='profile'
                className='rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary'
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value='account'
                className='rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary'
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value='privacy'
                className='rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary'
              >
                Privacy
              </TabsTrigger>
              <TabsTrigger
                value='notifications'
                className='rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary'
              >
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value='profile' className='p-6 space-y-6'>
              <Profile />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value='account' className='p-6 space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Account Settings</h3>

                <Card className='bg-muted border-border'>
                  <CardHeader>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Lock className='w-4 h-4' />
                      Password & Security
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <Button variant='outline' className='w-full bg-transparent'>
                      Change Password
                    </Button>
                    <Button variant='outline' className='w-full bg-transparent'>
                      Two-Factor Authentication
                    </Button>
                  </CardContent>
                </Card>

                <Card className='bg-muted border-border mt-4'>
                  <CardHeader>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Shield className='w-4 h-4' />
                      Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage your active sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant='outline' className='w-full bg-transparent'>
                      View All Sessions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value='privacy' className='p-6 space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Privacy Settings</h3>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Who can see your profile</h4>
                      <p className='text-sm text-muted-foreground'>
                        Control who can view your profile information
                      </p>
                    </div>
                    <select className='px-3 py-1 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary'>
                      <option>Everyone</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Last seen status</h4>
                      <p className='text-sm text-muted-foreground'>
                        Show when you were last active
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Online status</h4>
                      <p className='text-sm text-muted-foreground'>
                        Show your online status to others
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value='notifications' className='p-6 space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <Bell className='w-5 h-5' />
                  Notification Preferences
                </h3>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Messages</h4>
                      <p className='text-sm text-muted-foreground'>
                        Notifications for new messages
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Friend Requests</h4>
                      <p className='text-sm text-muted-foreground'>
                        Notifications for new friend requests
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Call Notifications</h4>
                      <p className='text-sm text-muted-foreground'>
                        Notifications when someone calls you
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-muted rounded-lg border border-border'>
                    <div>
                      <h4 className='font-medium'>Sound</h4>
                      <p className='text-sm text-muted-foreground'>
                        Play sound for notifications
                      </p>
                    </div>
                    <button className='relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors'>
                      <span className='inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1' />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
