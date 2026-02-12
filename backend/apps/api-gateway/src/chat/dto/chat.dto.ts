import { IsNotEmpty } from 'class-validator'

export interface Member {
  username: string
  avatar?: string | undefined
  userId: string
  lastReadAt?: string | undefined
  fullName?: string | undefined
}

export class CreateConversationDTO {
  @IsNotEmpty()
  members: Member[]

  @IsNotEmpty()
  groupName: string

  groupAvatar?: string
}

export class AddMemberToConversationDTO {
  @IsNotEmpty({
    message: 'conversationId is required',
  })
  conversationId: string

  @IsNotEmpty({
    message: 'memberIds is required',
  })
  members: Member[]
}

export class SendMessageDTO {
  @IsNotEmpty()
  conversationId: string

  @IsNotEmpty()
  message: string
}

export class ReadMessageDto {
  @IsNotEmpty()
  conversationId: string

  @IsNotEmpty()
  lastReadMessageId: string
}
