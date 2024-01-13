import { Injectable } from '@nestjs/common';
import { CreateUserInput, GoogleUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/users/entities/user.entity';
import { Model } from 'mongoose';
import { GraphQLError } from 'graphql/error';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    try {
      const user = new this.userModel(createUserInput);
      return await user.save();
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async createGoogleUser(createUserInput: GoogleUserInput) {
    try {
      const user = new this.userModel(createUserInput);
      return await user.save();
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async findAll() {
    const users = await this.userModel.find({}).exec();
    return users;
  }

  async findOneId(id: string) {
    const user = await this.userModel.findById(id).exec();

    if (!user)
      throw new GraphQLError('not found', {
        extensions: { code: 'Error ' },
      });

    return user;
  }

  async findOne(email: string) {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findByFields(fields: any) {
    return await this.userModel.findOne(fields).exec();
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email }).exec();

    if (!user)
      throw new GraphQLError('not found', {
        extensions: { code: 'Error ' },
      });
    return user;
  }

  async findOneCheck(email: string) {
    const user = await this.userModel
      .findOne({ email: email })
      .select('+password')
      .exec();
    return user;
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
