import { ApiProperty } from '@nestjs/swagger';
import { InterviewType, SkillType } from '@/interview-booking/enums/index.enum';
import { IsDate, IsString } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({})
  @IsString({ message: 'The matchedUserOne must be a string' })
  matchedUserOne: string;

  @ApiProperty({})
  @IsString({ message: 'The matchedUserTwo must be a string' })
  matchedUserTwo: string;

  @ApiProperty({ description: 'Skill type', default: SkillType.HARD })
  @IsString({ message: 'The skill_type must be a string' })
  skill_type: string;

  @ApiProperty({ description: 'interview type', default: InterviewType.PEERS })
  @IsString({ message: 'The interview_type must be a string' })
  interview_type: string;

  @ApiProperty({})
  @IsDate({ message: 'The date must be a Date' })
  date: Date;
}
