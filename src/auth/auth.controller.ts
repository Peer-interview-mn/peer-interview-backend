import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordInput,
  CheckPassOtpInput,
  CreateAuthInput,
  CreateAuthInputNew,
  EmailInput,
  LoginInput,
  ResetTokenInput,
} from '@/auth/dto/create-auth.input';
// import { MailerService } from '@/mailer/mailer.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, // private readonly mailerService: MailerService,
  ) {}

  // google login with google token
  @Get('google/:token')
  async googleTokenAuth(@Param('token') token: string) {
    return await this.authService.googleTokenAuth(token);
  }

  // Register. the old version is no longer used
  @Post('sign-up')
  async register(@Body() createAuthInput: CreateAuthInput) {
    return await this.authService.register(createAuthInput);
  }

  // Register. the new version is now in use
  @Post('v1/sign-up')
  async registerNew(@Body() createAuthInput: CreateAuthInputNew) {
    return await this.authService.registerNew(createAuthInput);
  }

  // login with email and password
  @Post('sign-in')
  async login(@Body() createAuthInput: LoginInput) {
    return await this.authService.login(createAuthInput);
  }

  // send mail account verify code
  @Get('send-verify-mail/:mail')
  async sendVerifyMail(@Param('mail') mail: string) {
    return await this.authService.sendVerifyCodeToMail(mail);
  }

  // confirm account
  @Post('confirm-account')
  async confirmAccount(@Body() mailInput: EmailInput) {
    return await this.authService.confirmAccount(mailInput);
  }

  // send email forgot password
  @Get('forgot-password/:mail')
  async forgotPassword(@Param('mail') mail: string) {
    return await this.authService.forgotPassword(mail);
  }

  // change password with forgot password otp
  @Post('reset-password')
  async resetPassword(@Body() changePassInput: ChangePasswordInput) {
    return await this.authService.resetPassword(changePassInput);
  }

  // Check the otp code in the forgot password section
  @Post('check-changePass-opt')
  async checkOpt(@Body() changePassInput: CheckPassOtpInput) {
    return await this.authService.checkResetOtp(changePassInput);
  }

  @Post('login-with-refresh-token')
  async refToken(@Body() resetToken: ResetTokenInput) {
    return await this.authService.loginWithRefreshToken(
      resetToken.refresh_token,
    );
  }
}
