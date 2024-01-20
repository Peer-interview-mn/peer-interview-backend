import { SocialInput, SocialType } from './create-user.input';
// import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
export class UpdateUserInput {
  @ApiProperty({})
  @IsString({ message: 'The firstName must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsString({ message: 'The lastName must be a string' })
  lastName: string;

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
  @IsString({ message: 'The description must be a string' })
  description: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  interview_skill: string;

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
