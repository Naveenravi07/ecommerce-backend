import { Body, Controller, Get, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PreSignUploadDto, PresSignUrlResponseDto } from './dto/uploads.dto';
import { ZodResponse } from 'nestjs-zod';
import { apiSuccessResponseDto } from 'src/common/http/api-response.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @ZodResponse({ status: 200, type: apiSuccessResponseDto(PresSignUrlResponseDto,'PresSignUrlResponseDto'),description: 'Returns a presigned URL for uploading files to S3' })
  async getPresignedUrl(@Body() data: PreSignUploadDto) {
    const payload = await this.uploadsService.preSignUpload(data);
    return payload
  }
}

