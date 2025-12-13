import { NestFactory } from '@nestjs/core'
import { NotificationModule } from './notification.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NotificationModule)

  // 2. Kích hoạt Shutdown Hooks để khi bạn tắt app (Ctrl+C), nó ngắt kết nối RabbitMQ sạch sẽ
  app.enableShutdownHooks()
}
bootstrap()
