import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  password: string;

  @Field(() => String, { nullable: true })
  role: string;

  @Field(() => String, { nullable: true })
  phone: string;

  @Field(() => [String], { nullable: true })
  socials?: string[];

  @Field(() => String, { nullable: true })
  profileImg: string;
}

@InputType()
export class GoogleUserInput {
  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  verifyAccount: boolean;

  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String, { nullable: true })
  profileImg: string;
}
