import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RedisModule } from '@app/redis'
import { PrismaModule } from '@app/prisma'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard, CommonModule } from '@app/common'
import { UtilModule } from '@app/util'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'

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
    UtilModule,
    // ClientsModule.register([
    //   {
    //     name: 'RABBITMQ_SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost:5672'], // Nên để trong process.env
    //       exchange: 'user.events',
    //       exchangeType: 'topic',
    //     },
    //   },
    // ]),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'user.events',
          type: 'topic',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
