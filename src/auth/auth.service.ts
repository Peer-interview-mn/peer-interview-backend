import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthInput } from './dto/create-auth.input';
import { UsersService } from '@/users/users.service';
import { GraphQLError } from 'graphql/error';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async create(createAuthInput: CreateAuthInput) {
    const haveUser = await this.usersService.findOne(createAuthInput.email);
    if (haveUser)
      throw new GraphQLError('already exists', {
        extensions: { code: 'Error' },
      });

    try {
      const newUser = await this.usersService.create(createAuthInput);
      if (newUser) {
        const payload = {
          email: newUser.email,
          _id: newUser._id,
          role: newUser.role,
        };

        const token = await this.jwtService.signAsync(payload);
        return {
          user: newUser,
          token,
        };
      }
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async login(loginAuthInput: CreateAuthInput) {
    const { email, password } = loginAuthInput;

    const checkUser = await this.usersService.findOneCheck(email);
    console.log('che:', checkUser);
    if (!checkUser)
      throw new GraphQLError('invalid user!', {
        extensions: { code: 'Error' },
      });

    try {
      const pass = await checkUser.comparePassword(password);

      if (!pass) {
        throw new UnauthorizedException('email or password wrong');
      }

      const payload = {
        email: checkUser.email,
        _id: checkUser._id,
        role: checkUser.role,
      };
      const token = await this.jwtService.signAsync(payload);
      return {
        user: checkUser,
        token,
      };
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }
}
