import { DynamicModule, Module } from '@nestjs/common'
import { StorageR2Service } from './storage-r2.service'

export interface R2Config {
  accessKey: string
  secretKey: string
  endpoint: string
  bucket: string
  publicUrl?: string
}

@Module({})
export class StorageR2Module {
  static forRoot(config: R2Config): DynamicModule {
    return {
      module: StorageR2Module,
      providers: [
        {
          provide: 'R2_CONFIG',
          useValue: config,
        },
        StorageR2Service,
      ],
      exports: [StorageR2Service],
    }
  }
}
