import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@/users/entities/user.entity';

@ObjectType()
export class UserResponse {
  @Field(() => User)
  user: User;
  @Field(() => String)
  token: string;
}

@ObjectType()
export class MailResponse {
  @Field(() => Boolean)
  success: boolean;
}
