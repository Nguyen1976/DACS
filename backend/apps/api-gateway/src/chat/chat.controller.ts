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
  CreateConversationDTO,
  ReadMessageDto,
  SendMessageDTO,
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
    const parsedMembers = typeof createConversationDto.members === 'string'
      ? JSON.parse(createConversationDto.members || '[]')
      : (createConversationDto.members || [])
    
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
    return await this.chatService.addMemberToConversation({
      ...body,
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
  ) {
    const params = {
      limit: limit ? parseInt(limit, 10) : 20,
      page: page ? parseInt(page, 10) : 1,
    }
    const res = await this.chatService.getMessagesByConversationId(
      conversationId,
      userInfo.userId,
      params,
    )
    return res
  }

  @Post('send_message')
  @RequireLogin()
  async sendMessage(@Body() data: SendMessageDTO, @UserInfo() userInfo: any) {
    return await this.chatService.sendMessage({
      ...data,
      senderId: userInfo.userId,
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
}
