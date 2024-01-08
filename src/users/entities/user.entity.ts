import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

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
  name: string;

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

  @Prop({ required: true })
  @Field(() => String)
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
  googleId: string;

  @Prop()
  @Field(() => String, { nullable: true })
  socials: string[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compareSync(enteredPassword, this.password);
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
