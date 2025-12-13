import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'
import { LoginUserDto, MakeFriendDto, RegisterUserDto } from './dto/user.dto'
import {
  MakeFriendRequest,
  MakeFriendResponse,
  UpdateStatusResponse,
  USER_SERVICE_NAME,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
  UserServiceClient,
} from 'interfaces/user.grpc'
import type { ClientGrpc } from '@nestjs/microservices'
import { catchError, firstValueFrom, throwError } from 'rxjs'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import { FriendRequestStatus } from 'interfaces/user'

@Injectable()
export class UserService implements OnModuleInit {
  private userClient: UserServiceClient
  constructor(
    @Inject(USER_SERVICE_NAME) private client: ClientGrpc,
    @Inject(RealtimeGateway) private realtimeGateway: RealtimeGateway,
  ) {}

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
  async login(dto: LoginUserDto): Promise<UserLoginResponse> {
    let observable = this.userClient.login({
      email: dto.email,
      password: dto.password,
    } as UserLoginRequest)

    return await firstValueFrom(observable)
  }

  async makeFriend(dto: any): Promise<MakeFriendResponse> {
    const observable = this.userClient.makeFriend({
      senderId: dto.senderId,
      senderName: dto.username,
      friendEmail: dto.friendEmail,
    } as MakeFriendRequest)
    return await firstValueFrom(observable)
  }

  async updateStatusMakeFriend(dto: any): Promise<UpdateStatusResponse> {
    const inviterStatus = await this.realtimeGateway.checkUserOnline(
      dto.inviterId,
    )
    const observable = this.userClient.updateStatusMakeFriend({
      status: dto.status as FriendRequestStatus,
      inviteeId: dto.inviteeId,
      inviterId: dto.inviterId,
      inviterStatus,
    })

    //ở đây sẽ xử lý socket
    if (inviterStatus) {
      this.realtimeGateway.emitToUser(
        dto.inviterId,
        'update-friend-request-status',
        //trả về bản ghi thông báo luôn
        {
          inviteeId: dto.inviteeId,
          message: `Friend request to ${dto.inviteeName} has been ${dto.status}.`,
        },
      )
    }
    //chiều làm nốt trả về bản ghi thông báo luôn
    // data: {
    //     userId: data.inviterId,
    //     message: `Your friend request has been ${data.status}.`,
    //   },
    // if (data.status === 'ACCEPT') {
    //   message = `${data.inventerName} request has been accepted.`
    // } else {
    //   message = `${data.inventerName} request has been rejected.`
    // }
    return await firstValueFrom(observable)
  }
}
