import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import {
  AddMemberToConversationDTO,
  CreateMessageUploadUrlDTO,
  CreateConversationDTO,
  LeaveConversationDTO,
  ReadMessageDto,
  RemoveMemberFromConversationDTO,
} from './dto/chat.dto'
import { ChatService } from './chat.service'
import { RequireLogin, UserInfo } from '@app/common/common.decorator'
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor'
import type { Multer } from 'multer'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('groupAvatar', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @RequireLogin()
  async createConversation(
    @Body() createConversationDto: CreateConversationDTO,
    @UserInfo() userInfo: any,
    @UploadedFile() groupAvatar?: Multer.File,
  ) {
    const parsedMembers =
      typeof createConversationDto.members === 'string'
        ? JSON.parse(createConversationDto.members || '[]')
        : createConversationDto.members || []

    return await this.chatService.createConversation({
      ...createConversationDto,
      members: [
        ...(parsedMembers as any[]),
        {
          userId: userInfo.userId,
          username: userInfo.username,
          fullName: userInfo.fullName,
        },
      ],
      createrId: userInfo.userId,
      groupAvatar,
    })
  }

  //mai sẽ làm chức năng add member sau
  @Post('add-member')
  @RequireLogin()
  async addMemberToConversation(
    @Body() body: AddMemberToConversationDTO,
    @UserInfo() userInfo: any,
  ) {
    const providedMembers = body.members || []

    const normalizedMembers: Array<{
      userId: string
      username: string
      fullName?: string
      avatar?: string
    }> =
      providedMembers.length > 0
        ? providedMembers.map((member) => ({
            userId: member.userId,
            username: member.username || '',
            fullName: member.fullName,
            avatar: member.avatar,
          }))
        : (body.memberIds || []).map((memberId) => ({
            username: '',
            userId: memberId,
          }))

    return await this.chatService.addMemberToConversation({
      conversationId: body.conversationId,
      members: normalizedMembers,
      userId: userInfo.userId,
    })
  }

  @Post('remove-member')
  @RequireLogin()
  async removeMemberFromConversation(
    @Body() body: RemoveMemberFromConversationDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.removeMemberFromConversation({
      conversationId: body.conversationId,
      targetUserId: body.targetUserId,
      userId: userInfo.userId,
    })
  }

  @Post('leave-group')
  @RequireLogin()
  async leaveConversation(
    @Body() body: LeaveConversationDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.leaveConversation({
      conversationId: body.conversationId,
      userId: userInfo.userId,
    })
  }

  @Get('conversations')
  @RequireLogin()
  async getConversations(
    @UserInfo() userInfo: any,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const params = {
      limit: limit ? parseInt(limit, 10) : 20,
      cursor: cursor || null,
    }

    const res = await this.chatService.getConversations(userInfo.userId, params)

    return res
  }

  @Get('messages/:conversationId')
  @RequireLogin()
  async getMessagesByConversationId(
    @Param('conversationId') conversationId: string,
    @UserInfo() userInfo: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('cursor') cursor?: string,
  ) {
    const params = {
      limit: limit ? parseInt(limit, 10) : 20,
      page: page ? parseInt(page, 10) : 1,
      cursor: cursor || null,
    }
    const res = await this.chatService.getMessagesByConversationId(
      conversationId,
      userInfo.userId,
      params,
    )
    return res
  }

  @Get('assets')
  @RequireLogin()
  async getConversationAssets(
    @Query('conversationId') conversationId: string,
    @Query('kind') kind: 'MEDIA' | 'LINK' | 'DOC',
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @UserInfo() userInfo?: any,
  ) {
    const assetKind = ['MEDIA', 'LINK', 'DOC'].includes(kind) ? kind : 'MEDIA'

    return await this.chatService.getConversationAssets(
      conversationId,
      userInfo.userId,
      assetKind,
      {
        limit: limit ? parseInt(limit, 10) : 20,
        cursor: cursor || null,
      },
    )
  }

  @Post('media/presign')
  @RequireLogin()
  async createMessageUploadUrl(
    @Body() data: CreateMessageUploadUrlDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.createMessageUploadUrl({
      ...data,
      userId: userInfo.userId,
    })
  }

  @Post('read_message')
  @RequireLogin()
  async readMessage(@Body() data: ReadMessageDto, @UserInfo() userInfo: any) {
    return await this.chatService.readMessage({
      ...data,
      userId: userInfo.userId,
    })
  }

  @Get('search')
  @RequireLogin()
  async searchConversations(
    @Query('keyword') keyword: string,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.searchConversations(userInfo.userId, keyword)
  }

  @Get('/conversation-by-friend')
  @RequireLogin()
  async getConversationByFriendId(
    @Query('friendId') friendId: string,
    @UserInfo() userInfo: any,
  ) {
    return await this.chatService.getConversationByFriendId(
      friendId,
      userInfo.userId,
    )
  }
}
