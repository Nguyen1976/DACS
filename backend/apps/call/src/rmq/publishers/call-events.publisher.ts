import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import type {
  CallStartedPayload,
  CallAcceptedPayload,
  CallRejectedPayload,
  CallEndedPayload,
  CallParticipantJoinedPayload,
  CallParticipantLeftPayload,
} from 'libs/constant/rmq/payload'

@Injectable()
export class CallEventsPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishCallStarted(payload: CallStartedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_STARTED,
      payload,
    )
  }

  publishCallAccepted(payload: CallAcceptedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_ACCEPTED,
      payload,
    )
  }

  publishCallRejected(payload: CallRejectedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_REJECTED,
      payload,
    )
  }

  publishCallEnded(payload: CallEndedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_ENDED,
      payload,
    )
  }

  publishParticipantJoined(payload: CallParticipantJoinedPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_PARTICIPANT_JOINED,
      payload,
    )
  }

  publishParticipantLeft(payload: CallParticipantLeftPayload): void {
    this.amqpConnection.publish(
      EXCHANGE_RMQ.CALL_EVENTS,
      ROUTING_RMQ.CALL_PARTICIPANT_LEFT,
      payload,
    )
  }
}
