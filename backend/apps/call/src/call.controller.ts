import { Controller } from '@nestjs/common'
import { CallService } from './call.service'

@Controller()
export class CallController {
  constructor(private readonly callService: CallService) {}
}
