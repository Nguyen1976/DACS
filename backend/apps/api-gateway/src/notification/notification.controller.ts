import { RequireLogin, UserInfo } from '@app/common/common.decorator'
import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { GetNotificationsDto } from './dto'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @RequireLogin()
  getNotifications(
    @UserInfo() user: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const dto: GetNotificationsDto = {
      userId: user.userId,
      limit: limit || '5',
      page: page || '1',
    }

    return this.notificationService.getNotifications(dto)
  }

  @Patch(':notificationId/read')
  @RequireLogin()
  markNotificationAsRead(
    @UserInfo() user: any,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markNotificationAsRead({
      userId: user.userId,
      notificationId,
    })
  }

  @Patch('read-all')
  @RequireLogin()
  markAllNotificationsAsRead(@UserInfo() user: any) {
    return this.notificationService.markAllNotificationsAsRead({
      userId: user.userId,
    })
  }
}
