import { useState } from 'react'
import AnimatedBackground from '@/components/AnimatedBg'
import { AuthForm } from '@/components/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
        <AnimatedBackground />
      <div className='relative z-20 flex min-h-screen items-center justify-center p-4'>
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  )
}
