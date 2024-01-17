import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import {
  ChangePasswordInput,
  CreateAuthInput,
  EmailInput,
} from './dto/create-auth.input';
import { MailResponse, UserResponse } from '@/common/responses';
import { User } from '@/users/entities/user.entity';
// import { UpdateAuthInput } from './dto/update-auth.input';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, { name: 'register' })
  register(@Args('singUpInput') createAuthInput: CreateAuthInput) {
    return this.authService.register(createAuthInput);
  }

  @Mutation(() => UserResponse, { name: 'login' })
  login(@Args('loginInput') createAuthInput: CreateAuthInput) {
    return this.authService.login(createAuthInput);
  }

  @Mutation(() => MailResponse, { name: 'sendVerifyMail' })
  sendVerifyMail(@Args('emailInput') mailInput: EmailInput) {
    return this.authService.sendVerifyCodeToMail(mailInput.email);
  }

  @Mutation(() => UserResponse, { name: 'confirm_account' })
  confirmAccount(@Args('emailInput') mailInput: EmailInput) {
    return this.authService.confirmAccount(mailInput);
  }

  @Mutation(() => MailResponse, { name: 'forgot_password' })
  forgotPassword(@Args('emailInput') mailInput: EmailInput) {
    return this.authService.forgotPassword(mailInput.email);
  }

  @Mutation(() => User, { name: 'reset_password' })
  resetPassword(@Args('changePassInput') changePassInput: ChangePasswordInput) {
    return this.authService.resetPassword(changePassInput);
  }
}
