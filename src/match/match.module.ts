import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from '@/match/entities/match.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Match.name,
        useFactory: () => {
          return MatchSchema;
        },
      },
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
