import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export interface SocialType {
  type: string;
  href: string;
  file: string;
}

export class SocialInput {
  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  type: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  href: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  file: string;
}

export class CreateUserInput {
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
  // @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  password: string;

  // @ApiProperty({})
  // @IsNotEmpty({ message: 'The description is required' })
  // @IsString({ message: 'The description must be a string' })
  // phone: string;

  @ApiProperty({ type: [SocialInput] })
  socials?: SocialType[] | null;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  profileImg: string;
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
  profileImg: string;
}
