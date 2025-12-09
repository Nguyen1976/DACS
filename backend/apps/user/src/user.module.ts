import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RedisModule } from '@app/redis'

@Module({
  imports: [
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 1,
      },
      'USER_REDIS',
    ),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
