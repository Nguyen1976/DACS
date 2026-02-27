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
import * as cookie from 'cookie'

//nếu k đặt tên cổng thì nó sẽ trùng với cổng của http
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'realtime',
  credentials: true,
  pingInterval: 40000,
  pingTimeout: 10000,
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server

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
      const rawCookie = client.handshake.headers.cookie
      if (!rawCookie) {
        client.disconnect()
        return
      }

      const parsed = cookie.parse(rawCookie)
      const accessToken = parsed.accessToken

      if (!accessToken) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(accessToken)
      const userId = payload?.userId
      if (!userId) {
        client.disconnect()
        return
      }

      client.data.userId = userId

      const prevOnline = await this.userStatusStore.isOnline(userId)

      // 🔥 Join room theo user
      client.join(`user:${userId}`)

      // 🔥 Lưu Redis + TTL
      await this.userStatusStore.addConnection(userId, client.id)

      client.conn.on('packet', async (packet) => {
        if (packet.type === 'pong') {
          await this.redisClient.expire(`socket:${client.id}`, 60)
        }
      })

      //follow
      /**
       * khi user tạo 1 connect thì sẽ kiểm tra trong redis đã có connect nào chưa trước khi mà user online
       * trường hợp chưa có prev Online thì cần phải thông báo cho bạn bè là đã online
       *
       * ở đây sẽ publish 1 sự kiện cho user service xử lý
       * và user service sẽ lấy danh sách bạn bè của user đó rồi publish
       * lại vào đây với sự kiện user_online kèm theo id của mình
       * còn lại là fe xử lý
       */

      if (!prevOnline) {
        this.amqpConnection.publish(
          EXCHANGE_RMQ.REALTIME_EVENTS,
          ROUTING_RMQ.USER_ONLINE,
          { userId },
        )
      }
    } catch {
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (!userId) return

    await this.userStatusStore.removeConnection(userId, client.id)

    const stillOnline = await this.userStatusStore.isOnline(userId)

    if (!stillOnline) {
      // publish event qua RMQ nếu cần
      this.amqpConnection.publish(
        EXCHANGE_RMQ.REALTIME_EVENTS,
        ROUTING_RMQ.USER_OFFLINE,
        { userId },
      )
    }
  }

  @SubscribeMessage('pong')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    await this.redisClient.expire(`socket:${client.id}`, 60)
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
      this.server.to(`user:${userId}`).emit(event, data)
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
