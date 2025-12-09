import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'interfaces/user'
import { UserModule } from './user/user.module'
import { AuthGuard, CommonModule } from '@app/common'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: './proto/user.proto',
          url: 'localhost:50051',
        },
      },
    ]),
    UserModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [ClientsModule],
})
export class AppModule {}
