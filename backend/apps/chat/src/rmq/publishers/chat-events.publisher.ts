import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { EmitToUserPayload } from 'libs/constant/rmq/payload'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { SOCKET_EVENTS } from 'libs/constant/websocket/socket.events'

@Injectable()
export class ChatEventsPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishConversationCreated(conversation: any): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: conversation.memberIds,
        event: SOCKET_EVENTS.CHAT.NEW_CONVERSATION,
        data: { conversation },
      } as EmitToUserPayload,
    )
  }

  publishMessageSent(message: any, memberIds: string[]): void {
    const data = { ...message, memberIds }

    const senderId = String(message.senderId)
    const otherMemberIds = memberIds.filter((id) => id !== senderId)

    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: [senderId],
        event: SOCKET_EVENTS.CHAT.MESSAGE_ACK,
        data: {
          status: 'SUCCESS',
          clientMessageId: message.clientMessageId || message.tempMessageId,
          serverMessageId: message.id,
          conversationId: message.conversationId,
          duplicated: Boolean(message.duplicated),
          createdAt: message.createdAt,
          message,
        },
      } as EmitToUserPayload,
    )

    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: otherMemberIds,
        event: SOCKET_EVENTS.CHAT.MESSAGE_NEW,
        data: { message },
      } as EmitToUserPayload,
    )

    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: data.memberIds,
        event: SOCKET_EVENTS.CHAT.NEW_MESSAGE,
        data,
      } as EmitToUserPayload,
    )
  }

  publishMemberAddedToConversation(payload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: payload.newMemberIds,
        event: SOCKET_EVENTS.CHAT.NEW_MEMBER_ADDED,
        data: payload,
      } as EmitToUserPayload,
    )
  }

  publishMessageError(
    userId: string,
    payload: {
      clientMessageId?: string
      conversationId?: string
      code: string
      message: string
      retryable: boolean
    },
  ): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: [userId],
        event: SOCKET_EVENTS.CHAT.MESSAGE_ERROR,
        data: payload,
      } as EmitToUserPayload,
    )
  }
}
