import { PartialType } from '@nestjs/swagger';
import { CreateInterviewBookingDto } from './create-interview-booking.dto';

export class UpdateInterviewBookingDto extends PartialType(
  CreateInterviewBookingDto,
) {}
