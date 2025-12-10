import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { AppModule } from '../app.module'
@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
