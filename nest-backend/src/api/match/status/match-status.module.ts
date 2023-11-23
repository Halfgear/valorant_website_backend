import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchStatusService } from './match-status.service';
import { MatchStatus, MatchStatusSchema } from './schemas/status.schema';
import { UncollectedMatchStatus, UncollectedMatchStatusSchema } from './schemas/uncollected.status.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UncollectedMatchStatus.name, schema: UncollectedMatchStatusSchema },
      { name: MatchStatus.name, schema: MatchStatusSchema }
    ], 'match_info'),
  ],
  providers: [MatchStatusService],
  exports: [MatchStatusService]
})
export class MatchStatusModule { }
