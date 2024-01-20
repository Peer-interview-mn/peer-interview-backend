import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordInput,
  CheckPassOtpInput,
  CreateAuthInput,
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

  @Get('google/:token')
  async googleTokenAuth(@Param('token') token: string) {
    return await this.authService.googleTokenAuth(token);
  }

  @Post('sign-up')
  async register(@Body() createAuthInput: CreateAuthInput) {
    return await this.authService.register(createAuthInput);
  }

  @Post('sign-in')
  async login(@Body() createAuthInput: LoginInput) {
    return await this.authService.login(createAuthInput);
  }

  @Get('send-verify-mail/:mail')
  async sendVerifyMail(@Param('mail') mail: string) {
    return await this.authService.sendVerifyCodeToMail(mail);
  }

  @Post('confirm-account')
  async confirmAccount(@Body() mailInput: EmailInput) {
    return await this.authService.confirmAccount(mailInput);
  }

  @Get('forgot-password/:mail')
  async forgotPassword(@Param('mail') mail: string) {
    return await this.authService.forgotPassword(mail);
  }

  @Post('reset-password')
  async resetPassword(@Body() changePassInput: ChangePasswordInput) {
    return await this.authService.resetPassword(changePassInput);
  }

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
