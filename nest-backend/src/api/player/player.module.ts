import { Module } from '@nestjs/common';
import { PlayerSummaryModule } from './player-summary/player-summary.module';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { RsoModule } from '../rso/rso.module';
import { InfoModule } from '../info/info.module';

@Module({
  imports: [
    PlayerSummaryModule,
    RsoModule,
    InfoModule
  ],
  providers: [PlayerService],
  controllers: [PlayerController]
})
export class PlayerModule { }
