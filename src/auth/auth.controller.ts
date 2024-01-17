import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@/auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordInput,
  CreateAuthInput,
  EmailInput,
} from '@/auth/dto/create-auth.input';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    return await this.authService.googleLogin(req, res);
  }

  @Post('sign-up')
  async register(@Body() createAuthInput: CreateAuthInput) {
    return await this.authService.register(createAuthInput);
  }

  @Post('sign-in')
  async login(@Body() createAuthInput: CreateAuthInput) {
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
}
