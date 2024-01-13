import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMailerInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

export type MailDto = {
  toMail: string;
  subject: string;
  text: string;
  html: string;
};
