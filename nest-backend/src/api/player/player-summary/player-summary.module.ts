import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSummaryService } from './player-summary.service';
import { PlayerSummary, playerSummarySchema } from './schemas/player-summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: PlayerSummary.name, schema: playerSummarySchema
    }],
      'valorant',
    ),
  ],
  exports: [PlayerSummaryService],
  providers: [PlayerSummaryService]
})
export class PlayerSummaryModule { }
