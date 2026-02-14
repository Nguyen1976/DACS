import { Server, Socket } from 'socket.io'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { Inject, Injectable } from '@nestjs/common'
import { SOCKET_EVENTS } from 'libs/constant/websocket/socket.events'
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGE_RMQ } from 'libs/constant/rmq/exchange'
import { QUEUE_RMQ } from 'libs/constant/rmq/queue'
import { ROUTING_RMQ } from 'libs/constant/rmq/routing'
import { UserStatusStore } from './user-status.store'
import type { EmitToUserPayload } from 'libs/constant/rmq/payload'

//nếu k đặt tên cổng thì nó sẽ trùng với cổng của http
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private userStatusStore: UserStatusStore
  constructor(
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT')
    private redisClient: any,
    private readonly amqpConnection: AmqpConnection,
  ) {
    this.userStatusStore = new UserStatusStore(this.redisClient)
  }

  //default function
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token
      if (!token) {
        client.disconnect()
        return
      }
      const payload = this.jwtService.verify(token! as string)

      if (!payload.userId) {
        client.disconnect()
        return
      }
      client.data.userId = payload.userId
      await this.userStatusStore.addConnection(payload.userId, client.id)

      this.server.emit(SOCKET_EVENTS.CONNECTION, { userId: payload.userId })
    } catch (error) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (!userId) return
    this.userStatusStore.removeConnection(userId, client.id)
    if (!this.userStatusStore.isOnline(userId)) {
      this.server.emit(SOCKET_EVENTS.DISCONNECTION, { userId })
    }
  }

  async checkUserOnline(userId: string): Promise<boolean> {
    return this.userStatusStore.isOnline(userId)
  }

  @RabbitSubscribe({
    exchange: EXCHANGE_RMQ.REALTIME_EVENTS,
    routingKey: ROUTING_RMQ.EMIT_REALTIME_EVENT,
    queue: QUEUE_RMQ.REALTIME_EMIT_EVENT,
  })
  async emitToUser({ userIds, event, data }: EmitToUserPayload) {
    for (const userId of userIds) {
      const sockets = (await this.userStatusStore.getUserSockets(
        userId,
      )) as string[]
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data)
      })
    }
  }

  //nhận sự kiện send_message ở đây
  @SubscribeMessage(SOCKET_EVENTS.CHAT.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    //tin nhan duoc gui di qua rabbitmq
    this.amqpConnection.publish(
      EXCHANGE_RMQ.REALTIME_EVENTS,
      ROUTING_RMQ.SEND_MESSAGE,
      data,
    )
  }
}
//đoạn này có thể viết thành dùng chung thì sẽ giảm thiểu được code
//tức là chỉ viết 1 hàm emit user thì khi có sự kiện payload nó luôn là người nhận, tên sự kiện và data
//trước khi refactor thì sẽ load lại toàn bộ thông tin về socket io đã nhé
//còn 1 số sự kiện khác như user typing, message delivered, message seen thì sẽ làm sau vì cần phải tối ưu hơn nữa
//vì những sự kiện đó tần suất nó sẽ cao hơn nhiều so với những sự kiện hiện tại
//lên cho gateway này 1 exchange riêng biệt để tránh bị lẫn lộn với các service khác
