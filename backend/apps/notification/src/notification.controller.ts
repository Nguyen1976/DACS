import { Controller } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { GrpcMethod } from '@nestjs/microservices'
import {
  type GetNotificationsRequest,
  type GetNotificationsResponse,
  type MarkAllNotificationsAsReadRequest,
  type MarkAllNotificationsAsReadResponse,
  type MarkNotificationAsReadRequest,
  type MarkNotificationAsReadResponse,
  NOTIFICATION_GRPC_SERVICE_NAME,
  type createNotificationRequest,
  type NotificationGrpcServiceController,
} from 'interfaces/notification.grpc'
import { Metadata } from '@grpc/grpc-js'

@Controller()
export class NotificationController implements NotificationGrpcServiceController {
  constructor(private readonly notificationService: NotificationService) {}
  //thằng @golevelup/nestjs-rabbitmq sẽ k quét rabbitsub trong controller lên mọi thứ được chuyển thẳng vào trong service

  @GrpcMethod(NOTIFICATION_GRPC_SERVICE_NAME, 'createNotification')
  async createNotification(
    data: createNotificationRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await this.notificationService.createNotification(data)
    return res
  }

  @GrpcMethod(NOTIFICATION_GRPC_SERVICE_NAME, 'getNotifications')
  async getNotifications(
    data: GetNotificationsRequest,
    metadata: Metadata,
  ): Promise<GetNotificationsResponse> {
    const res = await this.notificationService.getNotifications(data)
    return res
  }

  @GrpcMethod(NOTIFICATION_GRPC_SERVICE_NAME, 'markNotificationAsRead')
  async markNotificationAsRead(
    data: MarkNotificationAsReadRequest,
    metadata: Metadata,
  ): Promise<MarkNotificationAsReadResponse> {
    const res = await this.notificationService.markNotificationAsRead(data)
    return res
  }

  @GrpcMethod(NOTIFICATION_GRPC_SERVICE_NAME, 'markAllNotificationsAsRead')
  async markAllNotificationsAsRead(
    data: MarkAllNotificationsAsReadRequest,
    metadata: Metadata,
  ): Promise<MarkAllNotificationsAsReadResponse> {
    const res = await this.notificationService.markAllNotificationsAsRead(data)
    return res
  }
}
