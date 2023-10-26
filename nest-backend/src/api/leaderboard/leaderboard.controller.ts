import { Controller, Get, Param, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
  ) { }

  @Get('rankers/region=:region')
  async getRankers(
    @Query('pageNum') pageNum: number,
    @Param('region') region: string,
  ): Promise<any> {
    return this.leaderboardService.getRankers(pageNum, region);
  }

}