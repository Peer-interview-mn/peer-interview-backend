import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsString } from 'class-validator';

export class CreateInterviewBookingDto {
  @ApiProperty({ description: 'Skill type', default: 'Soft' })
  @IsString({ message: 'The skill_type must be a string' })
  skill_type: string;

  @ApiProperty({ description: 'interview type', default: 'Peer' })
  @IsString({ message: 'The interview_type must be a string' })
  interview_type: string;

  @ApiProperty({})
  @IsDate({ message: 'The date must be a Date' })
  date: Date;

  @ApiProperty({ default: false })
  @IsBoolean({ message: 'The withFriend must be a boolean' })
  withFriend: boolean;
}
