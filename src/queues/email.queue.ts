import * as Bull from 'bull';
import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { EmailServiceInterface, EmailServiceType } from '../services/email.service';

export interface EmailQueueInterface {
  addJob(data: any);
}

@injectable()
export class EmailQueue implements EmailQueueInterface {
  private queueWrapper: any;

  constructor(
    @inject(EmailServiceType) private emailService: EmailServiceInterface
  ) {
    this.queueWrapper = new Bull('email_queue', 'redis://redis:6379');
    this.queueWrapper.process((job) => {
      return this.process(job);
    });
  }

  private async process(job: Bull.Job): Promise<boolean> {
    await this.emailService.send(
      job.data.sender,
      job.data.recipient,
      job.data.subject,
      job.data.text
    );
    return true;
  }

  addJob(data: any) {
    this.queueWrapper.add(data);
  }
}

const EmailQueueType = Symbol('EmailQueueInterface');
export { EmailQueueType };