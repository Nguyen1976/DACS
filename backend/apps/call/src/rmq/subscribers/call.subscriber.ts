import { Injectable } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { CallService } from '../../call.service'
import { CallEventsPublisher } from '../publishers/call-events.publisher'
import type { StartCallDto, AcceptCallDto, RejectCallDto, EndCallDto } from '../../dto/call.dto'

@Injectable()
export class CallSubscriber {
  private activeCalls: Map<
    string,
    {
      callId: string
      roomId: string
      participants: Map<string, { userId: string; username: string; token: string }>
    }
  > = new Map()

  constructor(
    private readonly callService: CallService,
    private readonly callEventsPublisher: CallEventsPublisher,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CALL_EVENTS,
    routingKey: ROUTING_RMQ.CALL_STARTED,
    queue: QUEUE_RMQ.CALL_SERVICE_CALL_STARTED,
  })
  async handleCallStarted(data: StartCallDto): Promise<void> {
    const callId = this.callService.generateCallId()
    const roomId = this.callService.generateRoomId(
      data.callType,
      data.conversationId,
    )
    const token = this.callService.generateAgoraToken(roomId, data.callerId)

    // Store call session
    const participants = new Map()
    participants.set(data.callerId, {
      userId: data.callerId,
      username: data.callerName,
      token,
    })

    this.activeCalls.set(callId, {
      callId,
      roomId,
      participants,
    })

    // Publish call started event
    this.callEventsPublisher.publishCallStarted({
      callId,
      roomId,
      callerId: data.callerId,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar,
      targetUserIds: data.targetUserIds,
      conversationId: data.conversationId,
      callType: data.callType,
      mediaType: data.mediaType,
    })
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CALL_EVENTS,
    routingKey: ROUTING_RMQ.CALL_ACCEPTED,
    queue: QUEUE_RMQ.CALL_SERVICE_CALL_ACCEPTED,
  })
  async handleCallAccepted(data: AcceptCallDto): Promise<void> {
    const callSession = this.activeCalls.get(data.callId)
    
    if (!callSession) {
      return
    }

    const token = this.callService.generateAgoraToken(
      data.roomId,
      data.userId,
    )

    // Add participant
    callSession.participants.set(data.userId, {
      userId: data.userId,
      username: data.username,
      token,
    })

    const participantUserIds = Array.from(callSession.participants.keys())

    // Publish call accepted event
    this.callEventsPublisher.publishCallAccepted({
      callId: data.callId,
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      userAvatar: data.userAvatar,
      token,
      participantUserIds,
    })
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CALL_EVENTS,
    routingKey: ROUTING_RMQ.CALL_REJECTED,
    queue: QUEUE_RMQ.CALL_SERVICE_CALL_REJECTED,
  })
  async handleCallRejected(data: RejectCallDto): Promise<void> {
    const callSession = this.activeCalls.get(data.callId)
    
    if (!callSession) {
      return
    }

    const participantUserIds = Array.from(callSession.participants.keys())

    // Publish call rejected event
    this.callEventsPublisher.publishCallRejected({
      callId: data.callId,
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      participantUserIds,
    })
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.CALL_EVENTS,
    routingKey: ROUTING_RMQ.CALL_ENDED,
    queue: QUEUE_RMQ.CALL_SERVICE_CALL_ENDED,
  })
  async handleCallEnded(data: EndCallDto): Promise<void> {
    const callSession = this.activeCalls.get(data.callId)
    
    if (!callSession) {
      return
    }

    const participantUserIds = Array.from(callSession.participants.keys())

    // Publish call ended event
    this.callEventsPublisher.publishCallEnded({
      callId: data.callId,
      roomId: data.roomId,
      endedBy: data.endedBy,
      participantUserIds,
      reason: data.reason,
    })

    // Clean up call session
    this.activeCalls.delete(data.callId)
  }
}
