import { Controller, Get, Query } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService
    ) { }

    @Get('summary')
    async getPlayerSummaryByPlayerNameTag(
      @Query('name') name: string,
      @Query('tag') tag: string
    ) {
      const playerSummary = await this.playerService.getPlayerSummaryByPlayerNameTag(name, tag);
      return playerSummary;
    }

    @Get('basicInfo')
    async getBasicInfoByPlayerNameTag(
      @Query('name') name: string,
      @Query('tag') tag: string
    ) {
      const playerSummary = await this.playerService.getPlayerBasicInfo(name, tag);
      return playerSummary;
    }

    @Get('seasonStat')
    async getSeasonStatByPlayerNameTagQueue(
      @Query('name') name: string,
      @Query('tag') tag: string,
      @Query('season') season: string,
      @Query('queue') queue: string
    ) {
      const playerSummary = await this.playerService.getPlayerSeasonSummary(name, tag, season, queue);
      return playerSummary;
    }
}
