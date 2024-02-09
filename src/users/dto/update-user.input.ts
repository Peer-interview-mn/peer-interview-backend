import { SocialInput, SocialType } from './create-user.input';
// import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
export class UpdateUserInputNew {
  @ApiProperty({})
  @IsString({ message: 'The firstName must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsString({ message: 'The lastName must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsString({ message: 'The userName must be a string' })
  userName: string;

  @ApiProperty({})
  @IsString({ message: 'The password must be a string' })
  password: string;

  @ApiProperty({ type: [SocialInput] })
  socials?: SocialType[] | null;

  @ApiProperty({ type: [String] })
  skills?: string[];

  @ApiProperty({})
  @IsString({ message: 'The profileImg must be a string' })
  profileImg: string;

  @ApiProperty({})
  @IsString({ message: 'The country must be a string' })
  country: string;

  @ApiProperty({})
  @IsString({ message: 'The location must be a string' })
  location: string;

  @ApiProperty({})
  @IsString({ message: 'The time zone must be a string' })
  time_zone: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  description: string;

  @ApiProperty({ type: [String] })
  interview_skill: string[];

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  role: string;

  @ApiProperty({})
  @IsString({ message: 'The website must be a string' })
  website: string;

  @ApiProperty({})
  @IsNumber()
  experience: number;
}

export class UpdateUserInput {
  @ApiProperty({})
  @IsString({ message: 'The firstName must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsString({ message: 'The lastName must be a string' })
  lastName: string;

  @ApiProperty({})
  @IsString({ message: 'The password must be a string' })
  password: string;

  @ApiProperty({ type: [SocialInput] })
  socials?: SocialType[] | null;

  @ApiProperty({ type: [String] })
  skills?: string[];

  @ApiProperty({})
  @IsString({ message: 'The profileImg must be a string' })
  profileImg: string;

  @ApiProperty({})
  @IsString({ message: 'The country must be a string' })
  country: string;

  @ApiProperty({})
  @IsString({ message: 'The location must be a string' })
  location: string;

  @ApiProperty({})
  @IsString({ message: 'The time zone must be a string' })
  time_zone: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  description: string;

  @ApiProperty({ type: [String] })
  interview_skill: string[];

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  role: string;

  @ApiProperty({})
  @IsString({ message: 'The website must be a string' })
  website: string;

  @ApiProperty({})
  @IsNumber()
  experience: number;
}

export class ChangePassInput {
  @ApiProperty({})
  @IsString({ message: 'The oldPassword must be a string' })
  oldPassword: string;

  @ApiProperty({})
  @IsString({ message: 'The newPassword must be a string' })
  newPassword: string;
}
