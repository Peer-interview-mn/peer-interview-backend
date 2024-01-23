import { BaseData } from '@/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InterviewBookingProcessType } from '@/interview-booking/enums/index.enum';

@Schema({ timestamps: true })
export class InterviewBooking extends BaseData {
  @Prop({
    type: String,
    enum: InterviewBookingProcessType,
    default: InterviewBookingProcessType.PENDING,
  })
  process: string;

  @Prop({ type: Boolean, default: false })
  withFriend: boolean;

  @Prop({ type: 'ObjectId', ref: 'User' })
  userId: string;

  @Prop({ Type: String })
  skill_type: string;

  @Prop({ Type: String })
  interview_type: string;

  @Prop({ type: Date })
  date: Date;
}

export const InterviewBookingSchema =
  SchemaFactory.createForClass(InterviewBooking);

/*
1. bi 30ni 15 tsagt hard skill ogno

2. bat 30ni 15 tsagt hard skill ogno
dorj 30ni 15 tsagt hard skill ogno

bi bat 30ni 15 tsagt hard skill interview
* */
