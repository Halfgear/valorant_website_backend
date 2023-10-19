import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoModule } from './api/info/info.module';
import dotenvConfigObject from './utils/dotenvConfigObject';
import { typeORMConfig } from './configs/typeorm.config';
import { StatsModule } from './api/stats/stats.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { TournamentModule } from './api/tournament/tournament.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './configs/typeorm.config.validation';
import { DifficultyModule } from './api/difficulty/difficulty.module';
import { LeaderboardModule } from './api/leaderboard/leaderboard.module';
import { SearchModule } from './api/search/search.module';

const envFilePath = dotenvConfigObject.path;
console.log('envFilePath', envFilePath);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath],
      isGlobal: true,
      validationSchema
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    InfoModule,
    StatsModule,
    TournamentModule,
    DifficultyModule,
    LeaderboardModule,
    SearchModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    }
  ],
})
export class AppModule { 

}