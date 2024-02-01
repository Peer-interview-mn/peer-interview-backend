import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MailerModule } from '@/mailer/mailer.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { OtpsModule } from '@/otps/otps.module';

@Module({
  imports: [
    OtpsModule,
    UsersModule,
    MailerModule,
    PassportModule,
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
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
