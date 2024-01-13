import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { GoogleUserInput } from './dto/create-auth.input';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      clientID:
        '529872912560-34eb669l8pcnjt43av0ge60fhf8uc3ar.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    // const user = {
    //   email: emails[0].value,
    //   firstName: name.givenName,
    //   lastName: name.familyName,
    //   picture: photos[0].value,
    //   accessToken,
    // };
    if (accessToken) {
      const myUser = await this.usersService.findOne(emails[0].value);
      if (myUser) {
        const token = await this.authService.generateJwtToken(myUser);
        done(null, { user: myUser, token });
      }
    }

    const createUser: GoogleUserInput = {
      email: emails[0].value,
      verifyAccount: true,
    };

    const newUser = await this.authService.googleUser(createUser);
    const token = await this.authService.generateJwtToken(newUser);
    done(null, { user: newUser, token });
  }
}
