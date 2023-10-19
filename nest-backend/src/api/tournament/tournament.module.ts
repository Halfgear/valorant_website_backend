import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoModule } from '../info/info.module';
import { Composition } from './entities/composition.entity';
import { MapTournament } from './entities/map.tournament.entity';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        MapTournament,
        Composition
    ]),
    InfoModule
  ],
    providers: [TournamentService],
    controllers: [TournamentController]
  })
export class TournamentModule {
    
}
