import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  public readonly client: S3Client;
  constructor(private readonly configService: ConfigService) {

    this.client = new S3Client({
      
      // For localstack support
      endpoint: this.configService.getOrThrow<string>('LOCAL_STACK_ENDPOINT'),
      forcePathStyle: true,

      
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_ACCESS_SECRET')
      },
    });

  }
}

