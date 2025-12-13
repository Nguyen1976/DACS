import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'interfaces/user.grpc'
import { UserModule } from './user/user.module'
import { AuthGuard, CommonModule } from '@app/common'
import { APP_GUARD } from '@nestjs/core'
import { PORT_GRPC } from 'libs/constant/port-grpc.constant'
import { RealtimeGateway } from './realtime/realtime.gateway'
import { RedisModule } from '@app/redis'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: './proto/user.grpc.proto',
          url: `localhost:${PORT_GRPC.USER_GRPC_PORT}`,
        },
      },
    ]),
    UserModule,
    CommonModule,
    RedisModule.forRoot(
      {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
      'REDIS_CLIENT',
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RealtimeGateway,
  ],
  exports: [ClientsModule, RealtimeGateway],
})
export class AppModule {}
