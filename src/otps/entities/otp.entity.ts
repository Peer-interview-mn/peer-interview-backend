import { BaseData } from '@/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OtpCodeType } from '../enums/index.enum';

@Schema({ timestamps: true })
export class Otp extends BaseData {
  @Prop({ type: 'ObjectId', ref: 'User' })
  userId: string;

  @Prop({ type: String, enum: OtpCodeType })
  type: string;

  @Prop({ type: String })
  code: string;

  @Prop({ Type: Date })
  code_expire: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
