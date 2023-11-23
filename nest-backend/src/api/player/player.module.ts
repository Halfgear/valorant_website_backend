import { Module } from '@nestjs/common';
import { PlayerSummaryModule } from './player-summary/player-summary.module';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { RsoModule } from '../rso/rso.module';
import { InfoModule } from '../info/info.module';
import { RiotModule } from '../riot/riot.module';
import { MatchStatusModule } from '../match/status/match-status.module';

@Module({
  imports: [
    PlayerSummaryModule,
    RsoModule,
    InfoModule,
    RiotModule,
    MatchStatusModule
  ],
  providers: [PlayerService],
  controllers: [PlayerController]
})
export class PlayerModule { }
