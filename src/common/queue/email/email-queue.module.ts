import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { ResendService } from 'src/common/mail/resend/resend.service';
import { EMAIL_QUEUE } from './constants';

export { EMAIL_QUEUE };

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailQueueService, EmailProcessor, ResendService],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
