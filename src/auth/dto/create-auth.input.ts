import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAuthInput {
  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String, { nullable: true })
  role: string;

  @Field(() => String, { nullable: true })
  phone: string;

  // @Field(() => [String], { nullable: true })
  // socials: string[];
}

@InputType()
export class GoogleUserInput {
  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  verifyAccount: boolean;
}

@InputType()
export class EmailInput {
  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  code: string;
}

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  resetToken: string;

  @Field(() => String)
  newPassword: string;
}
