import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserInput, GoogleUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/users/entities/user.entity';
import { Model } from 'mongoose';

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
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async createGoogleUser(createUserInput: GoogleUserInput) {
    try {
      const user = new this.userModel(createUserInput);
      return await user.save();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async findAll() {
    const users = await this.userModel.find({}).exec();
    return users;
  }

  async findOneId(id: string) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) throw new HttpException('not found', HttpStatus.NOT_FOUND);

      return user;
    } catch (e) {
      return e.message;
    }
  }

  async findOne(email: string) {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findByFields(fields: any) {
    return await this.userModel.findOne(fields).exec();
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email }).exec();

    if (!user) throw new HttpException('not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async findOneCheck(email: string) {
    const user = await this.userModel
      .findOne({ email: email })
      .select('+password')
      .exec();
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    delete updateUserInput['id'];
    try {
      const user = await this.userModel.findById(id).select('+password').exec();
      if (!user) throw new HttpException('not found', HttpStatus.NOT_FOUND);

      if (updateUserInput.password && user.password) {
        throw new HttpException(
          'you cannot change your passport directly',
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(user, updateUserInput);
      await user.save();
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
