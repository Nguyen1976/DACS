import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import type { StartCallDTO, AcceptCallDTO, RejectCallDTO, EndCallDTO } from './dto/call.dto'

@Injectable()
export class CallService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async startCall(
    dto: StartCallDTO,
    userInfo: { userId: string; username: string; avatar?: string },
  ): Promise<{ status: string; message: string }> {
    // Publish call.start event to RabbitMQ
    await this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_STARTED,
      {
        callerId: userInfo.userId,
        callerName: userInfo.username,
        callerAvatar: userInfo.avatar,
        targetUserIds: dto.targetUserIds,
        conversationId: dto.conversationId,
        callType: dto.callType,
        mediaType: dto.mediaType,
      },
    )

    return {
      status: 'success',
      message: 'Call initiated',
    }
  }

  async acceptCall(
    dto: AcceptCallDTO,
    userInfo: { userId: string; username: string; avatar?: string },
  ): Promise<{ status: string; message: string }> {
    // Publish call.accept event to RabbitMQ
    await this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_ACCEPTED,
      {
        callId: dto.callId,
        roomId: dto.roomId,
        userId: userInfo.userId,
        username: userInfo.username,
        userAvatar: userInfo.avatar,
      },
    )

    return {
      status: 'success',
      message: 'Call accepted',
    }
  }

  async rejectCall(
    dto: RejectCallDTO,
    userInfo: { userId: string; username: string },
  ): Promise<{ status: string; message: string }> {
    // Publish call.reject event to RabbitMQ
    await this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_REJECTED,
      {
        callId: dto.callId,
        roomId: dto.roomId,
        userId: userInfo.userId,
        username: userInfo.username,
      },
    )

    return {
      status: 'success',
      message: 'Call rejected',
    }
  }

  async endCall(
    dto: EndCallDTO,
    userInfo: { userId: string },
  ): Promise<{ status: string; message: string }> {
    // Publish call.end event to RabbitMQ
    await this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_ENDED,
      {
        callId: dto.callId,
        roomId: dto.roomId,
        endedBy: userInfo.userId,
        reason: dto.reason,
      },
    )

    return {
      status: 'success',
      message: 'Call ended',
    }
  }
}
