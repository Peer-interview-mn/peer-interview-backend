import { CreateMailerInput } from './create-mailer.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMailerInput extends PartialType(CreateMailerInput) {
  id: number;
}
