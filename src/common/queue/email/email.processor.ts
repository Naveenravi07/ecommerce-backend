import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from './constants';
import { SendEmailJobData } from './email-queue.service';
import { ResendService } from 'src/common/mail/resend/resend.service';
import { PinoLogger } from 'nestjs-pino';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(
    private readonly resendService: ResendService,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(EmailProcessor.name);
  }

  async process(job: Job<SendEmailJobData>): Promise<void> {
    const { to, subject, html } = job.data;

    try {
      this.logger.info(`Processing email job ${job.id} for ${to}`);
      
      await this.resendService.sendEmail(to, html, subject);
      
      this.logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(
        { error: error.message, to, subject },
        `Failed to send email in job ${job.id}`,
      );
      throw error;
    }
  }
}
