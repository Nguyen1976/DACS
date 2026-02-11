import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator'

export class StartCallDTO {
  @IsArray()
  @IsString({ each: true })
  targetUserIds: string[]

  @IsOptional()
  @IsString()
  conversationId?: string

  @IsEnum(['DIRECT', 'GROUP'])
  callType: 'DIRECT' | 'GROUP'

  @IsEnum(['AUDIO', 'VIDEO'])
  mediaType: 'AUDIO' | 'VIDEO'
}

export class AcceptCallDTO {
  @IsString()
  callId: string

  @IsString()
  roomId: string
}

export class RejectCallDTO {
  @IsString()
  callId: string

  @IsString()
  roomId: string
}

export class EndCallDTO {
  @IsString()
  callId: string

  @IsString()
  roomId: string

  @IsOptional()
  @IsString()
  reason?: string
}
