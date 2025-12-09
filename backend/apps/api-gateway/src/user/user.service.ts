import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { RegisterUserDto } from './dto/user.dto'
import {
  USER_SERVICE_NAME,
  UserRegisterRequest,
  UserRegisterResponse,
  UserServiceClient,
} from 'interfaces/user'
import type { ClientGrpc } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class UserService implements OnModuleInit {
  private userClient: UserServiceClient
  constructor(@Inject(USER_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.userClient =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }

  async register(dto: RegisterUserDto): Promise<UserRegisterResponse> {
    let observable = this.userClient.register({
      email: dto.email,
      password: dto.password,
      username: dto.username,
    } as UserRegisterRequest)
    return await firstValueFrom(observable)
  }
}
