import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsPositive,
  Max,
  Min,
  IsString,
  IsArray,
} from 'class-validator';
import { InterviewBookingProcessType } from '@/interview-booking/enums/index.enum';

export class GetIVMeQuery {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsPositive()
  page: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Min(0)
  @Max(20)
  limit: number;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  process: InterviewBookingProcessType;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  neProcess: InterviewBookingProcessType;
}
