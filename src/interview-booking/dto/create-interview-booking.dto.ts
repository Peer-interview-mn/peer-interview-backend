import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { InterviewType, SkillType } from '../enums/index.enum';

export class CreateInterviewBookingDto {
  @ApiProperty({ description: 'Skill type', default: SkillType.HARD })
  @IsString({ message: 'The skill_type must be a string' })
  skill_type: string;

  @ApiProperty({ description: 'interview type', default: InterviewType.PEERS })
  @IsString({ message: 'The interview_type must be a string' })
  interview_type: string;
}

export class InviteToBookingDto {
  @ApiProperty({})
  @IsString({ message: 'The email must be a string' })
  email: string;
}

export class InviteToBookingUserDto {
  @ApiProperty({})
  emails: string[];
}

export class InvitesToBookingDto {
  @ApiProperty({})
  @IsString({ message: 'The email must be a string array' })
  email: string;
}
