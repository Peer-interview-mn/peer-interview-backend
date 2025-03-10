import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '@/config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { InterviewBookingModule } from './interview-booking/interview-booking.module';
import { MatchModule } from './match/match.module';
import { OtpsModule } from './otps/otps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo_uri'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MailerModule,
    FileUploadModule,
    InterviewBookingModule,
    MatchModule,
    OtpsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LowercaseFieldsMiddleware).forRoutes('*');
  // }
}
