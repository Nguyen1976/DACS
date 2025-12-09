import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto)
  }

  @Get('user')
  getUser() {
    return { message: 'Get user endpoint' }
  }
}
