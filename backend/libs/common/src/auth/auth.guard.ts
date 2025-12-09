import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { Observable } from 'rxjs'

interface JwtUserData {
  userId: string
  username: string
}

declare module 'express' {
  interface Request {
    user: JwtUserData
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService

  @Inject()
  private reflector: Reflector

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const requiredLogin = this.reflector.getAllAndOverride('without-login', [
      context.getClass(),
      context.getHandler(),
    ])
    console.log('🚀 ~ auth.guard.ts:29 ~ requiredLogin:', requiredLogin)

    if (!requiredLogin) {
      return true
    }

    const authorization = request.headers.authorization
    if (!authorization) {
      throw new UnauthorizedException('Missing token...')
    }

    try {
      const token = authorization.split(' ')[1]
      const payload = this.jwtService.verify<JwtUserData>(token)
      request.user = {
        userId: payload.userId,
        username: payload.username,
      }
    } catch (error) {
      throw new UnauthorizedException('Error token')
    }
    return true
  }
}
