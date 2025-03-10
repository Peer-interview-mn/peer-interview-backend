import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserInput,
  CreateUserInputNew,
  GoogleUserInput,
} from './dto/create-user.input';
import {
  ChangePassInput,
  UpdateUserInput,
  UpdateUserInputNew,
} from './dto/update-user.input';
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

  async createNew(createUserInput: CreateUserInputNew) {
    try {
      const user = new this.userModel(createUserInput);
      return await user.save();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createGoogleUser(createUserInput: GoogleUserInput) {
    try {
      const user = new this.userModel(createUserInput);
      return await user.save();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    const users = await this.userModel
      .find(
        {},
        {
          // systemRole: 0,
          password: 0,
          verifyAccount: 0,
        },
      )
      .exec();
    return users;
  }

  async findOneId(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (e) {
      return e.message;
    }
  }

  async me(id: string) {
    try {
      const user = await this.userModel.findById(id, {
        // systemRole: 0,
        password: 0,
        verifyAccount: 0,
      });

      if (!user) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (e) {
      return e.message;
    }
  }

  async findOne(email: string) {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findByUserName(userName: string) {
    const user = await this.userModel.findOne({ userName: userName }).exec();

    if (!user) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async findByFields(fields: any) {
    return await this.userModel.findOne(fields).exec();
  }

  async findOneCheck(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();

    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    try {
      const user = await this.userModel.findById(id);
      if (!user.verifyAccount) {
        throw new HttpException('Cannot be changed', HttpStatus.BAD_REQUEST);
      }

      if (!user) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      if (updateUserInput.password) {
        if (user.password) {
          throw new HttpException(
            'Password cannot be changed',
            HttpStatus.BAD_REQUEST,
          );
        }
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
        const isValid = passwordRegex.test(updateUserInput.password);
        if (!isValid)
          throw new HttpException(
            'The password must contain at least one uppercase letter, one special character, and one number.',
            HttpStatus.BAD_REQUEST,
          );
      }

      Object.assign(user, updateUserInput);
      await user.save();
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateNew(id: string, updateUserInput: UpdateUserInputNew) {
    const { userName, password } = updateUserInput;
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      if (!user.verifyAccount) {
        throw new HttpException('Cannot be changed', HttpStatus.BAD_REQUEST);
      }

      if (userName) {
        const haveUserName = await this.userModel.findOne({
          userName: userName,
        });

        if (haveUserName) {
          if (
            haveUserName &&
            haveUserName.email === user.email &&
            haveUserName.userName === userName
          ) {
            user.userName = userName;
          } else {
            throw new HttpException(
              `this ${userName} username already exists`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      if (password) {
        if (user.password) {
          throw new HttpException(
            'Password cannot be changed',
            HttpStatus.BAD_REQUEST,
          );
        }
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
        const isValid = passwordRegex.test(password);
        if (!isValid) {
          throw new HttpException(
            'The password must contain at least one uppercase letter, one special character, and one number.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      Object.assign(user, updateUserInput);
      await user.save();
      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async changePass(userId: string, dto: ChangePassInput) {
    const { oldPassword, newPassword } = dto;
    try {
      const user = await this.userModel
        .findById(userId)
        .select('+password')
        .exec();

      if (!user) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      if (!user.password) {
        throw new UnauthorizedException(
          'Password not matched, Please make sure your passwords.',
        );
      }

      const pass = await user.comparePassword(oldPassword);

      if (!pass) {
        throw new UnauthorizedException(
          'Password not matched, Please make sure your passwords.',
        );
      }

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;

      const isValid = passwordRegex.test(newPassword);
      if (!isValid) {
        throw new HttpException(
          'The password must contain at least one uppercase letter, one special character, and one number.',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = newPassword;
      await user.save();
      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new HttpException('not found user', HttpStatus.NOT_FOUND);
    return user;
  }

  async checkFields(id: string) {
    const requiredFields = [
      'experience',
      'skills',
      'role',
      'country',
      // 'interview_skill',
    ];
    const user = await this.userModel.findById(id);
    if (!user) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    for (const field of requiredFields) {
      if (!user[field] || !user['skills'].length) {
        return false;
      }
    }
    return true;
  }
}
