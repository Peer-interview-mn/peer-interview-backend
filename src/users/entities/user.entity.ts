import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Schema({ timestamps: true })
export class Social {
  @Prop()
  user_name: string;
}

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({
    unique: true,
  })
  userName: string;

  @Prop({
    default:
      'https://placehold.co/150X150/EEE/31343C?font=playfair-display&text=U',
  })
  profileImg: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({
    unique: true,
    required: true,
    match:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-]+.)+[a-zA-Z]{2,4}))$/,
  })
  email: string;

  @Prop({
    minlength: 8,
    match:
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/,
  })
  password: string;

  @Prop()
  phone: string;

  @Prop({ default: false })
  verifyAccount: boolean;

  @Prop()
  account_verify_code: string;

  @Prop()
  avc_expire: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpire: Date;

  @Prop()
  socials: string[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compareSync(enteredPassword, this.password);
  }

  async generatePasswordChangeToken(): Promise<string> {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ userName: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.loadClass(User);
