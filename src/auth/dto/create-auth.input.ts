import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthInputNew {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;
}

export class CreateAuthInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  userName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;
}

export class LoginInput {
  @ApiProperty({
    description: 'User email',
    default: 'string@gmail.com',
  })
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  email: string;

  @ApiProperty({ description: 'User password', default: 'String1234@' })
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
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  userName: string;

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
  resetPasswordOtp: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  newPassword: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  userId: string;
}

export class CheckPassOtpInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  resetPasswordOtp: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  mail: string;
}

export class ResetTokenInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  refresh_token: string;
}
