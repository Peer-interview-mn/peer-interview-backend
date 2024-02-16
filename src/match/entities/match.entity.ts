import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseData } from '@/shared';

@Schema({ timestamps: true })
export class Match extends BaseData {
  @Prop({ type: 'ObjectId', ref: 'User' })
  matchedUserOne: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  matchedUserTwo: string;

  @Prop({ Type: String })
  skill_type: string;

  @Prop({ Type: String })
  interview_type: string;

  @Prop({ type: Date, default: null })
  date: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
