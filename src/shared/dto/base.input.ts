import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BaseDataInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  name: string;
  // @Field(() => String, { nullable: true })
  // slug: string;
}
