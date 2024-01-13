import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Schema({ timestamps: true })
@ObjectType()
export class Social {
  @Prop()
  @Field(() => String, { nullable: true })
  user_name: string;
}

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Prop()
  @Field(() => String, { nullable: true })
  firstName: string;

  @Prop()
  @Field(() => String, { nullable: true })
  lastName: string;

  @Prop({ default: 'user' })
  @Field(() => String, { nullable: true })
  role: string;

  @Prop({
    unique: true,
    required: true,
    match: /^\w+([\.-]?id\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  })
  @Field(() => String)
  email: string;

  @Prop()
  @Field(() => String, { nullable: true })
  password: string;

  @Prop()
  @Field(() => String, { nullable: true })
  phone: string;

  @Prop({ default: false })
  @Field(() => Boolean, { nullable: true })
  verifyAccount: boolean;

  @Prop()
  @Field(() => String, { nullable: true })
  account_verify_code: string;

  @Prop()
  @Field(() => Date, { nullable: true })
  avc_expire: Date;

  @Prop()
  @Field(() => String, { nullable: true })
  resetPasswordToken: string;

  @Prop()
  @Field(() => Date, { nullable: true })
  resetPasswordExpire: Date;

  @Prop()
  @Field(() => String, { nullable: true })
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
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.loadClass(User);
