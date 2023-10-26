import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { AgentInfo } from './entities/agent.info.entity';
import { WeaponInfo } from './entities/weapon.info.entity';
import { SprayInfo } from './entities/spray.info.entity';
import { MapInfo } from './entities/map.info.entity';
import { CardInfo } from './entities/card.info.entity';
import { DifficultyModule } from '../difficulty/difficulty.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        AgentInfo,
        WeaponInfo,
        SprayInfo,
        CardInfo,
        MapInfo
      ]),
      DifficultyModule
    ],
    controllers: [InfoController],
    providers: [InfoService],
    exports: [InfoService],
  })
  export class InfoModule {}
  
  