import { Body, Controller, Get, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PreSignUploadDto } from './dto/uploads.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  async getPresignedUrl(@Body() data: PreSignUploadDto) {
    return await this.uploadsService.preSignUpload(data);
  }
}

