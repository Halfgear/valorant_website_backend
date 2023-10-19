import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { AgentInfo } from './entities/agent.info.entity';
import { WeaponInfo } from './entities/weapon.info.entity';
import { SprayInfo } from './entities/spray.info.entity';
import { MapInfo } from './entities/map.info.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        AgentInfo,
        WeaponInfo,
        SprayInfo,
        MapInfo
      ]),
    ],
    controllers: [InfoController],
    providers: [InfoService],
    exports: [InfoService],
  })
  export class InfoModule {}
  
  