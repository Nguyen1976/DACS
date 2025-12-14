import { IsNotEmpty } from 'class-validator'

export class CreateConversationDTO {
  @IsNotEmpty()
  memberIds: string[]

  @IsNotEmpty()
  groupName: string

  groupAvatar?: string
}

export class AddMemberToConversationDTO {
  @IsNotEmpty()
  conversationId: string

  @IsNotEmpty()
  memberIds: string[]
}
