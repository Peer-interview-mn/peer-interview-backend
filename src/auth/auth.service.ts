import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ChangePasswordInput,
  CreateAuthInput,
  EmailInput,
  GoogleUserInput,
} from './dto/create-auth.input';
import { UsersService } from '@/users/users.service';
import { GraphQLError } from 'graphql/error';
import { JwtService } from '@nestjs/jwt';
import { generateVerifyCode, verifyCodeCheck } from '@/common/verifyCode';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { MailerService } from '@/mailer/mailer.service';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}
  async register(createAuthInput: CreateAuthInput) {
    const haveUser = await this.usersService.findOne(createAuthInput.email);
    if (haveUser)
      throw new GraphQLError('already exists', {
        extensions: { code: 'Error' },
      });

    try {
      const newUser = await this.usersService.create(createAuthInput);
      if (newUser) return newUser;
      throw new GraphQLError('failed', {
        extensions: { code: 'Error' },
      });
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async googleUser(createAuthInput: GoogleUserInput) {
    const haveUser = await this.usersService.findOne(createAuthInput.email);
    if (haveUser)
      throw new GraphQLError('already exists', {
        extensions: { code: 'Error' },
      });

    try {
      const newUser = await this.usersService.createGoogleUser(createAuthInput);
      if (newUser) return newUser;
      throw new GraphQLError('failed', {
        extensions: { code: 'Error' },
      });
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async generateJwtToken(user: User) {
    const payload = {
      email: user.email,
      _id: user._id,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async login(loginAuthInput: CreateAuthInput) {
    const { email, password } = loginAuthInput;

    try {
      const checkUser = await this.usersService.findOneCheck(email);

      if (!checkUser)
        throw new GraphQLError('invalid user!', {
          extensions: { code: 'Error' },
        });

      if (!checkUser.verifyAccount)
        throw new GraphQLError('This account has not been verified!', {
          extensions: { code: 'Error' },
        });

      if (!checkUser.password) {
        throw new UnauthorizedException('email or password wrong');
      }

      const pass = await checkUser.comparePassword(password);

      if (!pass) {
        throw new UnauthorizedException('email or password wrong');
      }

      const token = await this.generateJwtToken(checkUser);
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

  async sendVerifyCodeToMail(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new GraphQLError(`this ${email} not found. pls register`, {
          extensions: { code: 'Error' },
        });

      if (user.verifyAccount)
        throw new GraphQLError(`this ${email} already verified`, {
          extensions: { code: 'Error' },
        });

      const code = generateVerifyCode();

      user.account_verify_code = code.code;
      user.avc_expire = code.expireDate;
      await user.save();

      const sendMail = await this.mailerService.sendMail({
        toMail: email,
        subject: 'Mail verify code',
        text: 'welcome my friend',
        html: `
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
          <h1>Welcome Peer Interview </h1>
          <br><p>your account verify code: ${code.code}</p></br>
        </div>`,
      });
      if (sendMail)
        return {
          success: true,
        };

      return {
        success: false,
      };
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async confirmAccount(mailInput: EmailInput) {
    const { email, code } = mailInput;
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new GraphQLError(`this ${email} not found. pls register`, {
          extensions: { code: 'Error' },
        });

      if (user.verifyAccount)
        throw new GraphQLError(`this ${email} already verified`, {
          extensions: { code: 'Error' },
        });

      const verify = verifyCodeCheck(user, code);
      if (!verify)
        throw new GraphQLError(`wrong code`, {
          extensions: { code: 'Error' },
        });

      user.verifyAccount = true;
      user.account_verify_code = null;
      user.avc_expire = null;
      await user.save();

      const token = await this.generateJwtToken(user);
      return {
        user: user,
        token,
      };
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new GraphQLError(`this ${email} not found`, {
          extensions: { code: 'Error' },
        });

      const resetToken = await user.generatePasswordChangeToken();
      await user.save();

      const link = `https://www.peerinterview.io/changepassword/${resetToken}`;
      const message = `sain bnu.<br><br>doorh linked darj nuuts ugee solino uu!:<br> <a  href=${link}>${link}</a>`;
      const sendMail = await this.mailerService.sendMail({
        toMail: email,
        subject: 'Solih',
        text: 'solih',
        html: message,
      });

      if (sendMail)
        return {
          success: true,
        };
      return {
        success: false,
      };
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async resetPassword(changePasswordInput: ChangePasswordInput) {
    try {
      const { newPassword, resetToken } = changePasswordInput;

      const encrypted = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const user = await this.usersService.findByFields({
        resetPasswordToken: encrypted,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (!user)
        throw new GraphQLError(`wrong code`, {
          extensions: { code: 'Error' },
        });

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return user;
    } catch (e) {
      throw new GraphQLError(e.message, {
        extensions: { code: 'Error' },
      });
    }
  }

  async googleLogin(req: Request, res: Response) {
    console.log('user: ', req.user);
    if (!req.user) {
      res.json({ failed: true });
    }
    res.json(req.user);
  }
}
