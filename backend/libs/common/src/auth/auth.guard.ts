import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { Request, Response } from 'express'
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    if (!request) {
      throw new UnauthorizedException({
        message: 'UNAUTHORIZED',
        code: 'REQUEST_CONTEXT_INVALID',
      })
    }

    const withoutLogin = this.reflector.getAllAndOverride<boolean>(
      'without-login',
      [context.getHandler(), context.getClass()],
    )

    if (withoutLogin) return true

    const accessToken =
      request.cookies?.accessToken ||
      this.getCookieValue(request.headers?.cookie, 'accessToken')
    const refreshToken =
      request.cookies?.refreshToken ||
      this.getCookieValue(request.headers?.cookie, 'refreshToken')
    if (!accessToken) {
      throw new UnauthorizedException({
        message: 'UNAUTHORIZED',
        code: 'ACCESS_TOKEN_MISSING',
      })
    }

    try {
      const payload = this.jwtService.verify(accessToken)
      request['user'] = payload
      return true
    } catch (err) {
      // 🔥 Chỉ refresh khi access hết hạn
      if (err instanceof TokenExpiredError) {
        if (!refreshToken) {
          throw new UnauthorizedException({
            message: 'UNAUTHORIZED',
            code: 'REFRESH_TOKEN_MISSING',
          })
        }

        try {
          const refreshPayload = this.jwtService.verify(refreshToken)

          const newAccessToken = this.jwtService.sign(
            {
              userId: refreshPayload['userId'],
              username: refreshPayload['username'],
            },
            { expiresIn: '15m' },
          )

          response.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
          })

          request['user'] = refreshPayload
          return true
        } catch {
          throw new UnauthorizedException({
            message: 'UNAUTHORIZED',
            code: 'REFRESH_TOKEN_INVALID',
          })
        }
      }

      // 🔥 Token invalid (signature sai)
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          message: 'UNAUTHORIZED',
          code: 'TOKEN_INVALID',
        })
      }

      throw new UnauthorizedException({
        message: 'UNAUTHORIZED',
        code: 'AUTH_FAILED',
      })
    }
  }

  private getCookieValue(
    cookieHeader: string | undefined,
    key: string,
  ): string | null {
    if (!cookieHeader) return null

    const chunks = cookieHeader.split(';')
    for (const chunk of chunks) {
      const [cookieKey, ...cookieValueParts] = chunk.trim().split('=')
      if (cookieKey === key) {
        return decodeURIComponent(cookieValueParts.join('='))
      }
    }

    return null
  }
}
