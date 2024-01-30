import { Module } from '@nestjs/common';
import { InterviewBookingService } from './interview-booking.service';
import { InterviewBookingController } from './interview-booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InterviewBooking,
  InterviewBookingSchema,
} from '@/interview-booking/entities/interview-booking.entity';
import { MailerService } from '@/mailer/mailer.service';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    UsersModule,
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
  providers: [InterviewBookingService, MailerService],
})
export class InterviewBookingModule {}
