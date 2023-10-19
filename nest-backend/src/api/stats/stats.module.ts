import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentStats } from './entities/agent.stat.entity';
import { MapStats } from './entities/map.stat.entity';
import { MapAgentStats } from './entities/map-agent.stat.entity';
import { InfoModule } from '../info/info.module';
import { DifficultyModule } from '../difficulty/difficulty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapAgentStats,
      AgentStats,
      MapStats,
  ]),
  InfoModule,
  DifficultyModule
],
  providers: [StatsService],
  controllers: [StatsController]
})
export class StatsModule {}
