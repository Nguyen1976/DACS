import { NestFactory } from '@nestjs/core'
import { CallModule } from './call.module'

async function bootstrap() {
  const app = await NestFactory.create(CallModule)
  await app.listen(3004)
  console.log('Call Service is running on port 3004')
}
bootstrap()
