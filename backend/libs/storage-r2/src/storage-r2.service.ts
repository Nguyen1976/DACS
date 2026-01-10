import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { R2Config } from './storage-r2.module'

@Injectable()
export class StorageR2Service {
  private readonly R2: S3Client
  private readonly bucket: string

  constructor(@Inject('R2_CONFIG') private readonly config: R2Config) {
    this.bucket = this.config.bucket

    this.R2 = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
    })
  }

  async upload({
    buffer,
    mime,
    folder = 'chat',
    ext = 'png',
  }: {
    buffer: Buffer
    mime: string
    folder?: string
    ext?: string
  }) {
    const key = `${folder}/${crypto.randomUUID()}.${ext}`
    await this.R2.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        ACL: 'public-read',
      }),
    )

    return `${this.config.publicUrl}/${key}`
  }
}
