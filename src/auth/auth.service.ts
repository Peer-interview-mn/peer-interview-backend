import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ChangePasswordInput,
  CreateAuthInput,
  EmailInput,
} from './dto/create-auth.input';
import { UsersService } from '@/users/users.service';
import { GraphQLError } from 'graphql/error';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { generateVerifyCode, verifyCodeCheck } from '@/common/verifyCode';
import * as crypto from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}
  async create(createAuthInput: CreateAuthInput) {
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

  async sendVerifyCodeToMail(mailInput: EmailInput) {
    const { email } = mailInput;
    try {
      const fromMail = this.configService.get<string>('smtp.from');
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

      const sendMail = this.sendMail(
        email,
        'Mail verify code',
        'welcome my friend',
        `
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
              <h1>Welcome Peer Interview </h1>
              <br><p>your account verify code: ${code.code}</p></br>
            </div>`,
      );
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

  async sendMail(toMail: string, subject: string, text: string, html: string) {
    const fromMail = this.configService.get<string>('smtp.from');
    const send = await this.mailerService.sendMail({
      to: toMail,
      from: fromMail,
      subject: subject,
      text: text,
      html: html,
    });

    return !!send;
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

      const payload = {
        email: user.email,
        _id: user._id,
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload);

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
      const message = `sain bnu.<br><br>doorh linked darj nuuts ugee solino uu!:<br>${link}`;
      const sendMail = await this.sendMail(email, 'Solih', 'solih', message);

      if (sendMail)
        return {
          success: true,
        };
      return false;
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
      return false;
    }
    return true;
  }
}
