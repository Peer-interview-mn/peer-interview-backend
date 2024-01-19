import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChangePasswordInput,
  CheckPassOtpInput,
  CreateAuthInput,
  EmailInput,
  GoogleUserInput,
  LoginInput,
} from './dto/create-auth.input';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { generateVerifyCode, verifyCodeCheck } from '@/common/verifyCode';
// import * as crypto from 'crypto';
import { MailerService } from '@/mailer/mailer.service';
import { User } from '@/users/entities/user.entity';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async googleTokenAuth(token: string) {
    try {
      const googleId = this.configService.get<string>('google.id');
      const googleSecret = this.configService.get<string>('google.secret');

      const client = new google.auth.OAuth2(googleId, googleSecret);
      client.setCredentials({ access_token: token });

      const oauth2 = google.oauth2({ auth: client, version: 'v2' });
      const { data } = await oauth2.userinfo.get();

      if (data) {
        const myUser = await this.usersService.findOne(data.email);

        if (myUser) {
          const accessToken = await this.generateJwtToken(myUser);
          return { access_token: accessToken };
        }

        const createUser: GoogleUserInput = {
          email: data.email,
          verifyAccount: true,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImg: data.picture,
        };

        const newUser = await this.googleUser(createUser);
        const accessToken = await this.generateJwtToken(newUser);
        const refreshToken = await this.generateRefToken(newUser);
        return { access_token: accessToken, refresh_token: refreshToken };
      }

      throw new BadRequestException(
        'Failed to retrieve user information from Google',
      );
    } catch (error) {
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }

  async register(createAuthInput: CreateAuthInput) {
    const { password, userName, email } = createAuthInput;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
    const isValid = passwordRegex.test(password);
    if (!isValid)
      throw new HttpException(
        'The password must contain at least one uppercase letter, one special character, and one number.',
        HttpStatus.BAD_REQUEST,
      );

    const haveUser = await this.usersService.findOne(email);
    const haveUserName = await this.usersService.findByFields({
      userName: userName,
    });
    if (haveUser)
      throw new HttpException('already exists', HttpStatus.NOT_FOUND);
    if (haveUserName)
      throw new HttpException('username already exists', HttpStatus.NOT_FOUND);

    try {
      const newUser = await this.usersService.create(createAuthInput);
      if (newUser) return newUser;
      throw new HttpException('failed', HttpStatus.NOT_FOUND);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async googleUser(createAuthInput: GoogleUserInput) {
    const haveUser = await this.usersService.findOne(createAuthInput.email);
    if (haveUser)
      throw new HttpException('already exists', HttpStatus.NOT_FOUND);

    try {
      const newUser = await this.usersService.createGoogleUser(createAuthInput);
      if (newUser) return newUser;
      throw new HttpException('failed', HttpStatus.NOT_FOUND);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async generateJwtToken(user: User) {
    const payload = {
      email: user.email,
      _id: user._id,
      role: user.systemRole,
      firstName: user.firstName,
    };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async generateRefToken(user: User) {
    const secret = this.configService.get<string>('ref.secret');
    const expiresIn = this.configService.get<string>('ref.expires_in');
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.systemRole,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImg: user.profileImg,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
    return token;
  }

  async login(loginAuthInput: LoginInput) {
    const { email, password } = loginAuthInput;

    try {
      const checkUser = await this.usersService.findOneCheck(email);

      if (!checkUser)
        throw new HttpException('invalid user', HttpStatus.NOT_FOUND);

      if (!checkUser.verifyAccount)
        throw new HttpException(
          'This account has not been verified!',
          HttpStatus.NOT_FOUND,
        );

      if (!checkUser.password) {
        throw new UnauthorizedException('email or password wrong');
      }

      const pass = await checkUser.comparePassword(password);

      if (!pass) {
        throw new UnauthorizedException('email or password wrong');
      }

      const token = await this.generateJwtToken(checkUser);
      const refreshToken = await this.generateRefToken(checkUser);
      return { access_token: token, refresh_token: refreshToken };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async sendVerifyCodeToMail(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new HttpException(
          'this ${email} not found. pls register',
          HttpStatus.NOT_FOUND,
        );

      if (user.verifyAccount)
        throw new HttpException(
          `this ${email} already verified`,
          HttpStatus.NOT_FOUND,
        );

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
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async confirmAccount(mailInput: EmailInput) {
    const { email, code } = mailInput;
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new HttpException(
          `this ${email} not found. pls register`,
          HttpStatus.NOT_FOUND,
        );

      if (user.verifyAccount)
        throw new HttpException(
          `this ${email} already verified`,
          HttpStatus.NOT_FOUND,
        );

      const verify = verifyCodeCheck(user, code);
      if (!verify) throw new HttpException(`wrong code`, HttpStatus.NOT_FOUND);

      user.verifyAccount = true;
      user.account_verify_code = null;
      user.avc_expire = null;
      await user.save();

      const token = await this.generateJwtToken(user);
      const refreshToken = await this.generateRefToken(user);
      return { access_token: token, refresh_token: refreshToken };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user)
        throw new HttpException(
          `this ${email} not found`,
          HttpStatus.NOT_FOUND,
        );

      const resetToken = await user.generatePasswordChangeToken();
      await user.save();

      const message = `sain bnu.<br><br>tanii nuuts ug sergeeh code bol!:<br> ${resetToken}`;
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
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async checkResetOtp(input: CheckPassOtpInput) {
    const user = await this.usersService.findByFields({
      email: input.mail,
      resetPasswordToken: input.resetPasswordOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new HttpException(`wrong code`, HttpStatus.NOT_FOUND);
    return user;
  }

  async resetPassword(changePasswordInput: ChangePasswordInput) {
    try {
      const { newPassword, resetPasswordOtp, userId } = changePasswordInput;

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
      const isValid = passwordRegex.test(newPassword);

      if (!isValid)
        throw new HttpException(
          'The password must contain at least one uppercase letter, one special character, and one number.',
          HttpStatus.BAD_REQUEST,
        );
      // const encrypted = crypto
      //   .createHash('sha256')
      //   .update(resetPasswordOtp)
      //   .digest('hex');

      const user = await this.usersService.findByFields({
        _id: userId,
        resetPasswordToken: resetPasswordOtp,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (!user) throw new HttpException(`wrong code`, HttpStatus.NOT_FOUND);

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async loginWithRefreshToken(refToken: string) {
    try {
      const secret = this.configService.get<string>('ref.secret');
      const subs = await this.jwtService.verifyAsync(refToken, {
        secret,
      });

      const user = await this.usersService.findOneId(subs.sub);
      if (!user) throw new HttpException('invalid user', HttpStatus.NOT_FOUND);

      const access_token = await this.generateJwtToken(user);
      return {
        access_token,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
