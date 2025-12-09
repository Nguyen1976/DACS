import { Inject, Injectable } from '@nestjs/common'
import { UserRegisterRequest, UserRegisterResponse } from 'interfaces/user'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor(@Inject('USER_REDIS') private readonly redis: RedisClient) {}

  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    // Implement registration logic here, e.g., save user to database
    // For demonstration, we will just return a mock response
    return {
      id: '1132312',
      email: data.email,
      username: data.username,
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    }
  }
}
