// leaderboard.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import {
    ApiGatewayTimeoutResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiResponse,
    ApiQuery,
  } from '@nestjs/swagger';

  
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiOperation({
    summary: '랭커 정보 조회',
    description: '상위 200등 이상 랭커 정보를 반환합니다.',
  })
  @ApiNotFoundResponse({
    description: '플레이어 정보가 없습니다.',
  })
  @ApiGatewayTimeoutResponse({
    description: '서버가 응답하지 않습니다.',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지번호' })
  @ApiResponse({
    status: 200,
    description: '랭커 정보 조회',
  })
  @Get('rankers/region=:region')
  async getRankers(
    @Paginate() query: PaginateQuery,
    @Param('region') region: string,
  ): Promise<any> {
    return this.leaderboardService.getRankers(query, region);
  }
}
