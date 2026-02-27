import { registerAs } from '@nestjs/config'

export const r2Config = registerAs('r2', () => {
  return {
    accessKey: process.env.R2_ACCESS_KEY,
    secretKey: process.env.R2_SECRET_KEY,
    endpoint: process.env.R2_ENDPOINT,
    bucket: process.env.R2_BUCKET,
  }
})
