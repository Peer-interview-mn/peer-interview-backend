import { CreateUserInput, SocialInput, SocialType } from './create-user.input';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  firstName: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  lastName: string;

  @ApiProperty({ type: [SocialInput] })
  socials?: SocialType[] | null;

  @ApiProperty({ type: [String] })
  skills?: string[];

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  profileImg: string;

  @ApiProperty({})
  @IsString({ message: 'The description must be a string' })
  country: string;

  @ApiProperty({})
  @IsNumber()
  experience: number;
}
