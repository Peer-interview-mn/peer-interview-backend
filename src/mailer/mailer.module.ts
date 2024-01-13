import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerResolver } from './mailer.resolver';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailerResolver, MailerService],
  exports: [MailerService],
})
export class MailerModule {}
