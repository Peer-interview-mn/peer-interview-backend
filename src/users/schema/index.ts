import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Prop()
  @Field(() => String, { nullable: true })
  user_name: string;

  @Prop()
  @Field(() => Boolean)
  isAdmin: boolean;

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

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compareSync(enteredPassword, this.password);
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.loadClass(User);
