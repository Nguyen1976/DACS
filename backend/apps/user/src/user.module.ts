import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RedisModule } from '@app/redis'
import { PrismaModule } from '@app/prisma'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard, CommonModule } from '@app/common'

@Module({
  imports: [
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
      'USER_REDIS',
    ),
    PrismaModule,
    CommonModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
