// libs/logger/src/logger.service.ts
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class LoggerService {
  constructor(
    @Inject('WINSTON_LOGGER')
    private readonly logger,
  ) {}

  info(msg: string, meta?: Record<string, any>) {
    this.logger.info(msg, meta)
  }

  error(msg: string, trace?: string) {
    this.logger.error(msg + (trace ? ` | ${trace}` : ''))
  }
}
