import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { BaseData } from '@/shared';
import { UserSystemRoleType } from '@/users/enums/index.enum';

@Schema({ timestamps: true })
export class Social {
  @Prop()
  type: string;

  @Prop({ default: null })
  href?: string;

  @Prop({ default: null })
  file?: string | null;
}

@Schema({ timestamps: true })
export class User extends BaseData {
  @Prop({ lowercase: true })
  firstName: string;

  @Prop({ lowercase: true })
  lastName: string;

  @Prop({
    lowercase: true,
  })
  userName: string;

  @Prop({ lowercase: true })
  country: string;

  @Prop({ type: String, default: 'UTC' })
  time_zone: string;

  @Prop()
  experience: number;

  @Prop({
    default:
      'https://placehold.co/150X150/EEE/31343C?font=playfair-display&text=U',
  })
  profileImg: string;

  @Prop({
    type: String,
    enum: UserSystemRoleType,
    default: UserSystemRoleType.USER,
  })
  systemRole: string;

  @Prop({ default: null })
  role: string;

  @Prop({ default: [] })
  interview_skill: string[];

  @Prop()
  description: string;

  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    match:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-]+.)+[a-zA-Z]{2,4}))$/,
  })
  email: string;

  @Prop({
    minlength: 8,
  })
  password: string;

  @Prop()
  phone: string;

  @Prop({ lowercase: true })
  location: string;

  @Prop({ default: false })
  verifyAccount: boolean;

  @Prop({ default: null })
  website: string;

  @Prop({ default: null })
  socials: Social[];

  @Prop({ default: [] })
  skills: string[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compareSync(enteredPassword, this.password);
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.loadClass(User);
