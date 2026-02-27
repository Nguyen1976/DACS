import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common'
import type { Multer } from 'multer'
import type { Response } from 'express'
import { UserService } from './user.service'
import {
  LoginUserDto,
  MakeFriendDto,
  RegisterUserDto,
  UpdateProfileDto,
  UpdateStatusMakeFriendDto,
} from './dto/user.dto'
import {
  RequireLogin,
  UserInfo,
  WithoutLogin,
} from '@app/common/common.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @WithoutLogin()
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto)
  }

  @Post('login')
  @WithoutLogin()
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.userService.login(loginUserDto)
    response.cookie('accessToken', res.accessToken, {
      httpOnly: true,
      secure: true,
    })
    response.cookie('refreshToken', res.refreshToken, {
      httpOnly: true,
      secure: true,
    })
    return res
  }

  @Post('logout')
  @WithoutLogin()
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken')
    response.clearCookie('refreshToken')
    return {
      message: 'Logout successful',
    }
  }

  @Get('')
  @RequireLogin()
  async getUserById(@Query('userId') userId: string) {
    return await this.userService.getUserById(userId)
  }

  @Post('make-friend')
  @RequireLogin()
  async makeFriend(@Body() body: MakeFriendDto, @UserInfo() user: any) {
    return await this.userService.makeFriend({
      inviterId: user.userId,
      inviterName: user.username,
      inviteeEmail: body.email,
    })
  }

  @Post('update-status-make-friend')
  @RequireLogin()
  async updateStatusMakeFriend(
    @Body() body: UpdateStatusMakeFriendDto,
    @UserInfo() user: any,
  ) {
    return await this.userService.updateStatusMakeFriend({
      ...body,
      inviteeId: user.userId,
      inviteeName: user.username,
    })
  }

  @Get('list-friends')
  @RequireLogin()
  async listFriends(
    @UserInfo() user: any,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return await this.userService.listFriends(user.userId, limit, page)
  }

  @Get('search')
  @RequireLogin()
  async searchUsers(@UserInfo() user: any, @Query('keyword') keyword: string) {
    return await this.userService.searchUsers(user.userId, keyword)
  }

  @Get('list-friend-requests')
  @RequireLogin()
  async listFriendRequests(
    @UserInfo() user: any,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return await this.userService.listFriendRequests(user.userId, limit, page)
  }

  @Get('detail-friend-request')
  @RequireLogin()
  async detailMakeFriend(
    @UserInfo() user: any,
    @Query('friendRequestId') friendRequestId: string,
  ) {
    return await this.userService.detailMakeFriend(friendRequestId)
  }

  @Post('update-profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @RequireLogin()
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @UserInfo() user: any,
    @UploadedFile() avatar?: Multer.File,
  ) {
    return await this.userService.updateProfile({
      ...dto,
      userId: user?.userId,
      avatar,
    })
  }
}
