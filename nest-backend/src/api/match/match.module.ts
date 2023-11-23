import { Module } from '@nestjs/common';
import { MatchStatusModule } from './status/match-status.module';
import { MatchService } from './match.service';

@Module({
  imports: [MatchStatusModule],
  providers: [MatchService]
})
export class MatchModule {}
