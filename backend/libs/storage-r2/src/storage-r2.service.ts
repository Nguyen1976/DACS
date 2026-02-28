import { Inject, Injectable } from '@nestjs/common'
import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
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

  async createPresignedUploadUrl({
    folder = 'chat-media',
    fileName,
    mime,
    expiresInSeconds = 300,
  }: {
    folder?: string
    fileName: string
    mime: string
    expiresInSeconds?: number
  }) {
    const ext = fileName.split('.').pop() || 'bin'
    const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mime,
    })

    const uploadUrl = await getSignedUrl(this.R2, command, {
      expiresIn: expiresInSeconds,
    })

    return {
      uploadUrl,
      objectKey: key,
      publicUrl: `${this.config.publicUrl}/${key}`,
      expiresInSeconds,
    }
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.R2.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        }),
      )
      return true
    } catch (error: any) {
      if (
        error instanceof NotFound ||
        error?.name === 'NotFound' ||
        error?.$metadata?.httpStatusCode === 404
      ) {
        return false
      }

      return true
    }
  }
}
