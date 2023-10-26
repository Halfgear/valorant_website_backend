import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { InfoModule } from '../info/info.module';
import { Leaderboard } from './entities/leaderboard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leaderboard
    ]),
    InfoModule
  ],
  providers: [
    LeaderboardService,
  ],
  controllers: [LeaderboardController]
})
export class LeaderboardModule {}
