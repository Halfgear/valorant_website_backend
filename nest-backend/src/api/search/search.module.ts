import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerSearch } from './entities/player.search.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerSearch
    ]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
