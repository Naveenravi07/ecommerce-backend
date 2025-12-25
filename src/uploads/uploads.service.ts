import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/common/s3/s3.service';
import { PreSignUploadDto } from './dto/uploads.dto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadsService {
    constructor(  private readonly s3Service: S3Service,
        private readonly configService: ConfigService
    ){}

    async preSignUpload(dto: PreSignUploadDto): Promise<string>{
        const {fileName, fileType} = dto;
        const extension = fileType.split("/")[1];
        const key = `${fileName}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: this.configService.getOrThrow<string>('AWS_RAW_BUCKET'),
            Key: key,
            ContentType: fileType,
        })
        const uploadUrl = await getSignedUrl(this.s3Service.client,command,{
            expiresIn: this.configService.getOrThrow<number>('AWS_PRESIGN_EXPIRY'),
        })
        return uploadUrl
    }

}
