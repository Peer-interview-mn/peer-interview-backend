import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from '@/match/entities/match.entity';
import {
  InterviewBooking,
  InterviewBookingSchema,
} from '@/interview-booking/entities/interview-booking.entity';
import { MailerModule } from '@/mailer/mailer.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Match.name,
        useFactory: () => {
          return MatchSchema;
        },
      },
      {
        name: InterviewBooking.name,
        useFactory: () => {
          const schema = InterviewBookingSchema;
          return schema;
        },
      },
    ]),
    MailerModule,
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
