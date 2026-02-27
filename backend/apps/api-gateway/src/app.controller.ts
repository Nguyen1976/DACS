import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { RateLimit } from './common/decorators/rate-limit.decorator'
import { WithoutLogin } from '@app/common/common.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('health')
  @WithoutLogin()
  // @RateLimit({ limit: 10, ttl: 60 })
  async getHealth() {
    return await this.appService.getHealth()
  }
}
