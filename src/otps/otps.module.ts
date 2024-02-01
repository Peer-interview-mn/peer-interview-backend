import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { OtpsController } from './otps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from '@/otps/entities/otp.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Otp.name,
        useFactory: () => {
          const schema = OtpSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [OtpsController],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
