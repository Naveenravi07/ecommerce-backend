import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, content: string, subject: string) {
    try {
      const data = await this.resend.emails.send({
        from: this.configService.getOrThrow('EMAIL_FROM_DOMAIN'), 
        to,
        subject: subject,
        html:content
      });
      return data;
    } catch (error) {
      throw new Error('Failed to send email: ' + error.message);
    }
  }
}