import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Login from './Login'
import Register from './Register'
import { ModeToggle } from '../ModeToggle'

interface AuthFormProps {
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  return (
    <Card className='w-full max-w-md backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl relative'>
      <div className='absolute top-4 right-4'>
        <ModeToggle />
      </div>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-3xl font-bold text-center'>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </CardTitle>
        <CardDescription className='text-center'>
          {mode === 'login'
            ? 'Enter your credentials to access your account'
            : 'Enter your information to create an account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as 'login' | 'register')}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2 mb-6'>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='register'>Register</TabsTrigger>
          </TabsList>
          <TabsContent value='login'>
            <Login />
          </TabsContent>
          <TabsContent value='register'>
            <Register />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2'>
        <div className='text-sm text-muted-foreground text-center'>
          {mode === 'login' ? (
            <>
              {"Don't have an account? "}
              <button
                onClick={() => onModeChange('register')}
                className='text-accent hover:underline font-medium'
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              {'Already have an account? '}
              <button
                onClick={() => onModeChange('login')}
                className='text-accent hover:underline font-medium'
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
