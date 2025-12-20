import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = (data: FormData) => {}

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='login-email'>Email</Label>
        {/* sẽ sử dụng kết hợp shadcnUI với react-hook-form vì shadcnUI tương thích với nó */}
        <Input
          id='login-email'
          type='email'
          placeholder='your@email.com'
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='login-password'>Password</Label>
        <Input
          id='login-password'
          type='password'
          placeholder='••••••••'
          required
        />
      </div>
      <Button type='submit' className='w-full'>
        Sign in
      </Button>
    </form>
  )
}

export default Login
