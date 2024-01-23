import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsString } from 'class-validator';

export class CreateInterviewBookingDto {
  @ApiProperty({})
  @IsString({ message: 'The skill_type must be a string' })
  skill_type: string;

  @ApiProperty({})
  @IsString({ message: 'The interview_type must be a string' })
  interview_type: string;

  @ApiProperty({})
  @IsDate({ message: 'The date must be a Date' })
  date: Date;

  @ApiProperty({ default: false })
  @IsBoolean({ message: 'The withFriend must be a boolean' })
  withFriend: boolean;
}
