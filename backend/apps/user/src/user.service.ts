import { Inject, Injectable } from '@nestjs/common'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor(@Inject('USER_REDIS') private readonly redis: RedisClient) {}

  getHello(): string {
    return 'Hello World!'
  }
}
