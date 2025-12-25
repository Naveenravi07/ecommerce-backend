import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/common/s3/s3.service';
import { uploadPurposesSchema,PreSignUploadDto, PresSignUrlResponse } from './dto/uploads.dto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PinoLogger } from 'nestjs-pino';

type UploadPurpose = z.infer<typeof uploadPurposesSchema>

const UPLOAD_PURPOSES: Record<UploadPurpose, string> = {
  product_image: 'products/raw',
  user_avatar: 'user_avatars/raw',
} as const

@Injectable()
export class UploadsService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
        private readonly logger: PinoLogger
    ){}

    async preSignUpload(dto: PreSignUploadDto): Promise<PresSignUrlResponse>{
        const {purpose, contentType, size} = dto;
        const extension = contentType.split("/")[1];

        const key  = `${UPLOAD_PURPOSES[purpose]}/${uuidv4()}.${extension}`;
        this.logger.info(`Generating pre-signed URL for key: ${key} on bucket: ${this.configService.getOrThrow<string>('AWS_BUCKET')}`);
        const command = new PutObjectCommand({
            Bucket: this.configService.getOrThrow<string>('AWS_BUCKET'),
            Key: key,
            ContentType: contentType,
        })

        const uploadUrl = await getSignedUrl(this.s3Service.client,command,{
            expiresIn: this.configService.getOrThrow<number>('AWS_PRESIGN_EXPIRY'),
        })
        return { uploadUrl, key }
    }

}
