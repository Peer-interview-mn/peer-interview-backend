import { CreateMailerInput } from './create-mailer.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMailerInput extends PartialType(CreateMailerInput) {
  @Field(() => Int)
  id: number;
}
