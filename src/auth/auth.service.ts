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
import { MailerService } from '@/mailer/mailer.service';
import { User } from '@/users/entities/user.entity';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { AccountVerifyCode, ForgotPassword } from '@/mailer/templateFuc';
import { OtpsService } from '@/otps/otps.service';
import { OtpCodeType } from '@/otps/enums/index.enum';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private otpService: OtpsService,
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
          if (!myUser.verifyAccount) {
            myUser.verifyAccount = true;
            await myUser.save();
          }
          const accessToken = await this.generateJwtToken(myUser);
          const refreshToken = await this.generateRefToken(myUser);
          return { access_token: accessToken, refresh_token: refreshToken };
        }

        const createUser: GoogleUserInput = {
          email: data.email,
          verifyAccount: true,
          userName: data.email,
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
    const { password, userName, email, lastName, firstName } = createAuthInput;

    const haveUser = await this.usersService.findOne(email);
    const haveUserName = await this.usersService.findByFields({
      userName: userName,
    });

    if (haveUser) {
      if (
        !haveUser.verifyAccount &&
        haveUser.lastName === lastName.toLowerCase() &&
        haveUser.firstName === firstName.toLowerCase() &&
        haveUser.userName === userName.toLowerCase()
      ) {
        haveUser.email = email;
        await haveUser.save();
        return haveUser;
      }
      throw new HttpException(
        `this ${email} mail already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (haveUserName) {
      if (
        !haveUserName.verifyAccount &&
        haveUserName.lastName === lastName.toLowerCase() &&
        haveUserName.firstName === firstName.toLowerCase()
      ) {
        haveUserName.email = email;
        await haveUserName.save();
        return haveUserName;
      }
      throw new HttpException(
        `this ${userName} username already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
    const isValid = passwordRegex.test(password);
    if (!isValid)
      throw new HttpException(
        'The password must contain at least one uppercase letter, one special character, and one number.',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const newUser = await this.usersService.create(createAuthInput);
      if (newUser) return newUser;
      throw new HttpException('Something went wrong', HttpStatus.NOT_FOUND);
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

      if (!checkUser) {
        throw new HttpException(
          "This user doesn't exist. Please make sure your email address.",
          HttpStatus.NOT_FOUND,
        );
      }

      if (!checkUser.verifyAccount) {
        throw new HttpException(
          'This account has not been verified!',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!checkUser.password) {
        throw new UnauthorizedException(
          'Password not matched, Please make sure your passwords.',
        );
      }

      const pass = await checkUser.comparePassword(password);

      if (!pass) {
        throw new UnauthorizedException(
          'Password not matched, Please make sure your passwords.',
        );
      }

      const token = await this.generateJwtToken(checkUser);
      const refreshToken = await this.generateRefToken(checkUser);
      return { access_token: token, refresh_token: refreshToken };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async sendVerifyCodeToMail(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user) {
        throw new HttpException(
          'this ${email} not found. pls register',
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.verifyAccount)
        throw new HttpException(
          `this ${email} already verified`,
          HttpStatus.NOT_FOUND,
        );

      const code = await this.otpService.createCode(
        user._id,
        OtpCodeType.VERIFYACCOUNT,
      );

      const sendMail = await this.mailerService.sendMail({
        toMail: email,
        subject: 'Peer to Peer Platform - OTP',
        text: 'Verify account OTP',
        html: AccountVerifyCode(code.code),
      });
      if (sendMail)
        return {
          success: true,
        };

      return {
        success: false,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async confirmAccount(mailInput: EmailInput) {
    const { email, code } = mailInput;
    try {
      const user = await this.usersService.findOne(email);

      if (!user) {
        throw new HttpException(
          `this ${email} not found. pls register`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.verifyAccount) {
        throw new HttpException(
          `this ${email} already verified`,
          HttpStatus.NOT_FOUND,
        );
      }

      const verify = await this.otpService.verifyCode(
        user._id,
        code,
        OtpCodeType.VERIFYACCOUNT,
      );

      if (!verify) {
        throw new HttpException(
          `OTP code is wrong. Please make sure OTP Code again`,
          HttpStatus.NOT_FOUND,
        );
      }

      user.verifyAccount = true;
      await user.save();

      const token = await this.generateJwtToken(user);
      const refreshToken = await this.generateRefToken(user);
      return { access_token: token, refresh_token: refreshToken };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne(email);

      if (!user) {
        throw new HttpException(
          `this ${email} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const resetToken = await this.otpService.createCode(
        user._id,
        OtpCodeType.RESETPASSWORD,
      );

      const sendMail = await this.mailerService.sendMail({
        toMail: email,
        subject: 'Peer to Peer Platform - Forgot password',
        text: 'Password change token',
        html: ForgotPassword(resetToken.code),
      });

      if (user && sendMail)
        return {
          success: true,
        };
      return {
        success: false,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkResetOtp(input: CheckPassOtpInput) {
    const user = await this.usersService.findOne(input.mail);

    if (!user) throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);

    await this.otpService.checkVerifyCode(
      user._id,
      input.resetPasswordOtp,
      OtpCodeType.RESETPASSWORD,
    );
    return user;
  }

  async resetPassword(changePasswordInput: ChangePasswordInput) {
    try {
      const { newPassword, resetPasswordOtp, userId } = changePasswordInput;

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
      const isValid = passwordRegex.test(newPassword);

      if (!isValid) {
        throw new HttpException(
          'The password must contain at least one uppercase letter, one special character, and one number.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.usersService.findOneId(userId);

      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      await this.otpService.verifyCode(
        userId,
        resetPasswordOtp,
        OtpCodeType.RESETPASSWORD,
      );

      user.password = newPassword;
      await user.save();

      return user;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async loginWithRefreshToken(refToken: string) {
    try {
      const secret = this.configService.get<string>('ref.secret');
      const subs = await this.jwtService.verifyAsync(refToken, {
        secret,
      });

      const user = await this.usersService.findOneId(subs.sub);
      if (!user) {
        throw new HttpException('invalid user', HttpStatus.NOT_FOUND);
      }

      const access_token = await this.generateJwtToken(user);
      return {
        access_token,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
