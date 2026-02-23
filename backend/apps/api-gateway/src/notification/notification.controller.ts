import { RequireLogin, UserInfo } from '@app/common/common.decorator'
import { Body, Controller, Get, Query } from '@nestjs/common'
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
}
