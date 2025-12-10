import { RmqOptions, Transport } from '@nestjs/microservices';

export function getRmqOptions(queue: string): RmqOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}