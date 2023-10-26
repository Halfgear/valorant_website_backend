import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRso } from './entity/rso.entity';
import { RsoService } from './rso.service';
import { RsoController } from './rso.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRso
    ]),
  ],
  exports: [RsoService],
  providers: [RsoService],
  controllers: [RsoController]
})
export class RsoModule {}
