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
        process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
      firstName: name.givenName,
      lastName: name.familyName,
      profileImg: photos[0].value,
    };

    const newUser = await this.authService.googleUser(createUser);
    const token = await this.authService.generateJwtToken(newUser);
    done(null, { user: newUser, token });
  }
}
