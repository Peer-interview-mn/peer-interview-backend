import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  userName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  password: string;

  // @ApiProperty({})
  // @IsString({ message: 'The description must be a string' })
  // phone: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  profileImg: string;

  // @Field(() => [String], { nullable: true })
  // socials: string[];
}

export class LoginInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  password: string;
}
export class GoogleUserInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;

  verifyAccount: boolean;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  profileImg: string;
}

export class EmailInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  code: string;
}

export class ChangePasswordInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  resetToken: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  newPassword: string;
}
