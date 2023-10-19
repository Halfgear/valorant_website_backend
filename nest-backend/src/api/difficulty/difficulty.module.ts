import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DifficultyService } from './difficulty.service';
import { Difficulty } from './entity/difficulty.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Difficulty
    ]),
  ],
  providers: [DifficultyService],
  exports: [DifficultyService]
})
export class DifficultyModule {
}
