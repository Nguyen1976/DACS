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
    const data = {
      ...message,
      memberIds,
    }
    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.EMIT_REALTIME_EVENT,
      {
        userIds: data.memberIds.filter((id) => id !== data.senderId),
        event: SOCKET_EVENTS.CHAT.NEW_MESSAGE,
        data,
      } as EmitToUserPayload,
    )
  }

  publishMemberAddedToConversation(payload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CHAT_EVENTS,
      ROUTING_RMQ.MEMBER_ADDED_TO_CONVERSATION,
      {
        userIds: payload.newMemberIds,
        event: SOCKET_EVENTS.CHAT.NEW_MEMBER_ADDED,
        data: payload,
      } as EmitToUserPayload,
    )
  }
}
