// leaderboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerLeaderboard } from './entities/player.leaderboard.entity';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    PlayerLeaderboard
  ])],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
