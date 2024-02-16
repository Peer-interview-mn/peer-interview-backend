import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInterviewBookingDto } from './create-interview-booking.dto';
import { IsDate, IsString } from 'class-validator';

export class UpdateInterviewBookingDto extends PartialType(
  CreateInterviewBookingDto,
) {
  @ApiProperty({})
  @IsDate({ message: 'The date must be a Date' })
  date: Date;

  @ApiProperty({})
  @IsString({ message: 'The utc must be a String' })
  Utc: Date;
}
