import { Controller } from '@nestjs/common'
import { UserService } from './user.service'
import { GrpcMethod } from '@nestjs/microservices'
import type { Metadata } from '@grpc/grpc-js'
import {
  type ListFriendsRequest,
  USER_GRPC_SERVICE_NAME,
  type MakeFriendRequest,
  type MakeFriendResponse,
  type UpdateStatusRequest,
  type UpdateStatusResponse,
  type UserGrpcServiceController,
  type UserRegisterRequest,
  type UserRegisterResponse,
  type UpdateProfileRequest,
  type UpdateProfileResponse,
  type GetUserByIdResponse,
  type GetUserByIdRequest,
} from 'interfaces/user.grpc'

@Controller()
export class UserController implements UserGrpcServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'register')
  async register(
    data: UserRegisterRequest,
    metadata: Metadata,
  ): Promise<UserRegisterResponse> {
    const res = await this.userService.register(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'login')
  async login(data: any, metadata: Metadata): Promise<any> {
    const res = await this.userService.login(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'makeFriend')
  async makeFriend(
    data: MakeFriendRequest,
    metadata: Metadata,
  ): Promise<MakeFriendResponse> {
    const res = await this.userService.makeFriend(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'updateStatusMakeFriend')
  async updateStatusMakeFriend(
    data: UpdateStatusRequest,
    metadata: Metadata,
  ): Promise<UpdateStatusResponse> {
    const res = await this.userService.updateStatusMakeFriend(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'listFriends')
  async listFriends(
    data: ListFriendsRequest,
    metadata: Metadata,
  ): Promise<any> {
    const res = await this.userService.listFriends(data.userId)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'detailMakeFriend')
  async detailMakeFriend(
    data: { friendRequestId: string },
    metadata: Metadata,
  ): Promise<any> {
    const res = await this.userService.detailMakeFriend(data.friendRequestId)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'updateProfile')
  async updateProfile(
    data: UpdateProfileRequest,
    metadata: Metadata,
  ): Promise<UpdateProfileResponse> {
    const res = await this.userService.updateProfile(data)
    return res
  }

  @GrpcMethod(USER_GRPC_SERVICE_NAME, 'getUserById')
  async getUserById(
    data: GetUserByIdRequest,
    metadata: Metadata,
  ): Promise<GetUserByIdResponse> {
    const res = await this.userService.getUserById(data.userId)
    return res
  }
}
