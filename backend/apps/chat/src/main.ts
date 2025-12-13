import { NestFactory } from '@nestjs/core'
import { ChatModule } from './chat.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'chat_queue',
        noAck: false,
        queueOptions: {
          durable: true,
        },
        exchange: 'user.events',
        exchangeType: 'topic',
        prefetchCount: 1,
      },
    },
  )
  await app.listen()
}
bootstrap()
