import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseData } from '@/shared';
import { User } from '@/users/entities/user.entity';

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

  @Prop({ type: Date })
  date: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
