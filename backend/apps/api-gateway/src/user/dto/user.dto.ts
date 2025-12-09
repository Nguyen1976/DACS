import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  @MaxLength(20, {
    message: 'Password is too long. Maximum length is $constraint1 characters',
  })
  @MinLength(6, {
    message: 'Password is too short. Minimum length is $constraint1 characters',
  })
  password: string

  @IsNotEmpty()
  @MaxLength(30, {
    message: 'Username is too long. Maximum length is $constraint1 characters',
  })
  @MinLength(3, {
    message: 'Username is too short. Minimum length is $constraint1 characters',
  })
  username: string
}
