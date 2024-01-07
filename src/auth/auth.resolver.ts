import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { CreateAuthInput } from './dto/create-auth.input';
import { UserResponse } from '@/common/responses';
// import { UpdateAuthInput } from './dto/update-auth.input';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserResponse, { name: 'register' })
  register(@Args('singUpInput') createAuthInput: CreateAuthInput) {
    return this.authService.create(createAuthInput);
  }

  @Mutation(() => UserResponse, { name: 'login' })
  login(@Args('loginInput') createAuthInput: CreateAuthInput) {
    return this.authService.login(createAuthInput);
  }
}
