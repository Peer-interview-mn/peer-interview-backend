import { Resolver } from '@nestjs/graphql';
// import { MailerService } from './mailer.service';
import { Mailer } from './entities/mailer.entity';

@Resolver(() => Mailer)
export class MailerResolver {
  // constructor(private readonly mailerService: MailerService) {}
}
