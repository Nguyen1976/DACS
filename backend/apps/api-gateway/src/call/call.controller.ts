import { Body, Controller, Post } from '@nestjs/common'
import { CallService } from './call.service'
import { RequireLogin, UserInfo } from '@app/common/common.decorator'
import type { StartCallDTO, AcceptCallDTO, RejectCallDTO, EndCallDTO } from './dto/call.dto'

@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('start')
  @RequireLogin()
  async startCall(
    @Body() dto: StartCallDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.callService.startCall(dto, userInfo)
  }

  @Post('accept')
  @RequireLogin()
  async acceptCall(
    @Body() dto: AcceptCallDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.callService.acceptCall(dto, userInfo)
  }

  @Post('reject')
  @RequireLogin()
  async rejectCall(
    @Body() dto: RejectCallDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.callService.rejectCall(dto, userInfo)
  }

  @Post('end')
  @RequireLogin()
  async endCall(
    @Body() dto: EndCallDTO,
    @UserInfo() userInfo: any,
  ) {
    return await this.callService.endCall(dto, userInfo)
  }
}
