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

  async sendEmailUsingTemplate(to: string, templateId: string, variables?: Record<string, any>) {
    try {
      const data = await this.resend.emails.send({
        from: 'noreply@notifications.naveenravi.dev', 
        to,
        template: {
          id: templateId,
          variables: variables || {},
        }
      });
      return data;
    } catch (error) {
      throw new Error('Failed to send email: ' + error.message);
    }
  }
}