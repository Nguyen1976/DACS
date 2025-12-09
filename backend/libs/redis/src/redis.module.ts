// libs/redis/redis.module.ts
import { DynamicModule, Module, Global } from '@nestjs/common'
import { RedisOptions } from 'ioredis'
import Redis from 'ioredis'

export interface RedisModuleOptions extends RedisOptions {}

@Global()
@Module({})
export class RedisModule {
  static forRoot(
    options: RedisModuleOptions,
    token: string = 'REDIS_CLIENT',
  ): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: token,
          useFactory: () => new Redis(options),
        },
      ],
      exports: [token],
    }
  }
}
