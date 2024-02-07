import { BaseData } from '@/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  InterviewBookingProcessType,
  InterviewType,
  SkillType,
} from '@/interview-booking/enums/index.enum';

@Schema({ timestamps: true })
export class InterviewBooking extends BaseData {
  @Prop({
    type: String,
    enum: InterviewBookingProcessType,
    default: InterviewBookingProcessType.PENDING,
  })
  process: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  userId: string;

  @Prop({ type: 'ObjectId', ref: 'User', default: null })
  connection_userId: string;

  @Prop({ type: String })
  invite_url: string;

  @Prop({ type: [String] })
  invite_users: string[];

  @Prop({ type: String, enum: SkillType, default: SkillType.HARD })
  skill_type: string;

  @Prop({ type: String, enum: InterviewType, default: InterviewType.PEERS })
  interview_type: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ type: Number })
  time: number;

  @Prop({ type: 'ObjectId', ref: 'Match', default: null })
  meetId: string;
}

export const InterviewBookingSchema =
  SchemaFactory.createForClass(InterviewBooking);
