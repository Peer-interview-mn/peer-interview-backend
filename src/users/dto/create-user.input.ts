import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export interface SocialType {
  type: string;
  href: string;
  file: string;
}

export interface SkillType {
  name: string;
}

export class SocialInput {
  @ApiProperty({})
  @IsString({ message: 'The type must be a string' })
  type: string;

  @ApiProperty({})
  @IsString({ message: 'The href must be a string' })
  href: string;

  @ApiProperty({})
  @IsString({ message: 'The file must be a string' })
  file: string;
}

export class SkillInput {
  @ApiProperty({})
  @IsString({ message: 'The name must be a string' })
  name: string;
}

export class CreateUserInputNew {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The email is required' })
  @IsString({ message: 'The email must be a string' })
  email: string;
}

export class CreateUserInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The userName is required' })
  @IsString({ message: 'The userName must be a string' })
  userName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The email is required' })
  @IsString({ message: 'The email must be a string' })
  email: string;
}

export class GoogleUserInput {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The email is required' })
  @IsString({ message: 'The email must be a string' })
  email: string;

  verifyAccount: boolean;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The firstName is required' })
  @IsString({ message: 'The firstName must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The lastName is required' })
  @IsString({ message: 'The lastName must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'The profileImg is required' })
  @IsString({ message: 'The profileImg must be a string' })
  profileImg: string;
}
