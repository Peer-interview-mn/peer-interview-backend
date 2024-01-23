import { Module } from '@nestjs/common';
import { InterviewBookingService } from './interview-booking.service';
import { InterviewBookingController } from './interview-booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InterviewBooking,
  InterviewBookingSchema,
} from '@/interview-booking/entities/interview-booking.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: InterviewBooking.name,
        useFactory: () => {
          const schema = InterviewBookingSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [InterviewBookingController],
  providers: [InterviewBookingService],
})
export class InterviewBookingModule {}
