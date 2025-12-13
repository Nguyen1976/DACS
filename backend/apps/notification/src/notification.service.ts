import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class NotificationService {
  @Inject(MailerService)
  private readonly mailerService: MailerService
  @Inject(PrismaService)
  private readonly prisma: PrismaService

  async handleUserRegistered(data: any) {
    await this.mailerService.sendUserConfirmation(data)
  }

  async handleMakeFriend(data: any) {
    await this.mailerService.sendMakeFriendNotification(data)
  }

  async handleUpdateStatusMakeFriend(data: any) {
    //kiểm tra nếu inviterStatus là online thì không gửi email
    // if (!data.inviterStatus) {
    //   // await this.mailerService.sendUpdateStatusMakeFriendNotification(data)
    // }
    //tạo bản ghi thông báo
    //k cần gửi mail nữa
    // inviterId: data.inviterId,
    //   inviteeId: data.inviteeId,
    //   status: data.status,
    //   inviterStatus: data.inviterStatus,
    let message = ''
    if (data.status === 'ACCEPT') {
      message = `${data.inventerName} request has been accepted.`
    } else {
      message = `${data.inventerName} request has been rejected.`
    }
    await this.prisma.notification.create({
      data: {
        userId: data.inviterId,
        message,
      },
    })
  }
}
