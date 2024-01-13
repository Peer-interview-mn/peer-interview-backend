import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MailerModule } from '';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from '@/auth/google.strategy';
import { MailerModule } from '@/mailer/mailer.module';

@Module({
  imports: [
    UsersModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.jwt_secret'),
        signOptions: {
          expiresIn: configService.get('jwt.jwt_expires_in'),
        },
      }),
      inject: [ConfigService],
    }),
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     transport: {
    //       host: configService.get<string>('smtp.host'),
    //       port: configService.get<string>('smtp.port'),
    //       secure: false,
    //       auth: {
    //         user: configService.get<string>('smtp.user'),
    //         pass: configService.get<string>('smtp.pass'),
    //       },
    //     },
    //     defaults: {
    //       from: configService.get<string>('smtp.from'),
    //     },
    //   }),
    // }),
  ],
  providers: [AuthResolver, AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
