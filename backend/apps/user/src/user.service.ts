import { PrismaService } from '@app/prisma'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRegisterRequest, UserRegisterResponse } from 'interfaces/user'
import { Redis as RedisClient } from 'ioredis'

@Injectable()
export class UserService {
  constructor() {}
  @Inject('USER_REDIS')
  private readonly redis: RedisClient

  @Inject(PrismaService)
  private readonly prisma: PrismaService

  @Inject(JwtService)
  private readonly jwtService: JwtService

  async register(data: UserRegisterRequest): Promise<UserRegisterResponse> {
    // Implement registration logic here, e.g., save user to database
    // For demonstration, we will just return a mock response
    //createdAt, updatedAt, password
    const { createdAt, updatedAt, password, ...res } =
      await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          username: data.username,
        },
      })
    const token = this.jwtService.sign(
      {
        userId: res.id,
        username: res.username,
      },
      {
        expiresIn: '7d',
      },
    )
    return {
      ...res,
      token,
    }
  }

  
}
