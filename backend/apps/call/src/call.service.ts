import { Injectable } from '@nestjs/common'
import { RtcTokenBuilder, RtcRole } from 'agora-token'

@Injectable()
export class CallService {
  private readonly appId: string
  private readonly appCertificate: string
  private readonly tokenExpirationTime = 3600 // 1 hour in seconds

  constructor() {
    this.appId = process.env.AGORA_APP_ID || '98bdf0b44c07441d8a143720963500f2'
    this.appCertificate =
      process.env.AGORA_APP_CERTIFICATE || '1900cd1671234c6d9b5a7f989151f1cf'
  }

  generateAgoraToken(roomId: string, userId: string): string {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const tokenExpire = this.tokenExpirationTime
    const privilegeExpire = currentTimestamp + this.tokenExpirationTime

    // Generate RTC token with PUBLISHER role using user account
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      this.appId,
      this.appCertificate,
      roomId,
      userId,
      RtcRole.PUBLISHER,
      tokenExpire,
      privilegeExpire,
    )

    return token
  }

  generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateRoomId(callType: 'DIRECT' | 'GROUP', conversationId?: string): string {
    if (callType === 'GROUP' && conversationId) {
      return conversationId
    }
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
