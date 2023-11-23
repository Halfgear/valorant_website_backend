import { BadRequestException, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiGatewayTimeoutResponse, ApiNotFoundResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService
  ) { }

  @Put('putRSO/:name/:tag/:rsoStatus')
  async updateUser(
    @Param('name') name: string,
    @Param('tag') tag: string,
    @Param('rsoStatus') rsoStatus: string
  ) {
    const rso = rsoStatus.toLowerCase();
    if (rso !== 'true' && rso !== 'false') {
      throw new BadRequestException('rsoStatus must be either "true" or "false".');
    }
    const isRso = rso === 'true';
    return await this.playerService.putPlayerRso(name, tag, isRso);
  }


  @Get('basicInfo')
  async getBasicInfoByPlayerNameTag(
    @Query('name') name: string,
    @Query('tag') tag: string
  ) {
    const playerSummary = await this.playerService.getPlayerBasicInfo(name, tag);
    return playerSummary;
  }

  @Get('checkRso')
  async checkRso(
    @Query('name') name: string,
    @Query('tag') tag: string
  ) {
    return await this.playerService.checkRso(name, tag);
  }

  @ApiOperation({
    summary: '갱신버튼 동작 - 최근 20경기 업데이트',
    description: '최근 20경기 match_ids 를 보내줍니다. ',
  })
  @ApiParam({
    name: 'puuid',
    required: true,
    description: '플레이어 puuid',
    type: String,
    example:
      '4iBGBuKD8s2qZ3dfuJ0XQEpUSuTuWYKAHDdXBtK_KPffssSz7Ek65JFdiBdZJFkTheKgrCidG7wYOg',
  })
  @ApiNotFoundResponse({
    description: '플레이어 정보가 없습니다.',
  })
  @ApiGatewayTimeoutResponse({
    description: '서버가 응답하지 않습니다.',
  })
  @Get('refresh-matchlist/:puuid')
  async refreshSummonerByPuuid(@Param('puuid') puuid: string): Promise<any> {
    const ret = {};
    ret['recentMatches'] = await this.playerService.refreshMatchList(puuid);
    return ret;
  }

  @ApiOperation({
    summary: '더보기 버튼 동작',
    description: '최근 20 * page 경기 recentMatches 를 보내줍니다.',
  })
  @ApiParam({
    name: 'puuid',
    required: true,
    description: 'puuid',
    type: String,
    example: '7dZMBprHDud8JAF5s6R-F5RBCeAGDN8oVUgRv2m5g2KVGLkQ6uZVq3s69bxfF-isAOwWuPZlEkaIsg',
  })
  @ApiNotFoundResponse({
    description: '플레이어 정보가 없습니다.',
  })
  @ApiGatewayTimeoutResponse({
    description: '서버가 응답하지 않습니다.',
  })
  @Get('recent-matches/:puuid')
  async getRecentMatches(
    @Param('puuid') puuid: string,
    @Query('page') page: number,
  ): Promise<any> {
    const ret = {};
    ret['recentMatches'] =
      await this.playerService.getRecentMatchesFromPlayerSummary(
        puuid,
        page,
      );
    return ret;
  }

  @Get('seasonStat')
  async getSeasonStatByPlayerNameTagQueue(
    @Query('name') name: string,
    @Query('tag') tag: string,
    @Query('episode') episode: string,
    @Query('act') act: string,
    @Query('queue') queue: string
  ) {
    const season = episode + '-' + act;
    const playerSummary = await this.playerService.getPlayerSeasonSummary(name, tag, season, queue);
    return playerSummary;
  }

  @Get('seasonAgentStat')
  async getSeasonAgentStatByPlayerNameTagQueue(
    @Query('name') name: string,
    @Query('tag') tag: string,
    @Query('episode') episode: string,
    @Query('act') act: string,
    @Query('queue') queue: string
  ) {
    const season = episode + '-' + act;
    const playerSummary = await this.playerService.getPlayerSeasonAgentSummary(name, tag, season, queue);
    return playerSummary;
  }

  @Get('seasonWeaponStat')
  async getSeasonWeaponStatByPlayerNameTagQueue(
    @Query('name') name: string,
    @Query('tag') tag: string,
    @Query('episode') episode: string,
    @Query('act') act: string,
    @Query('queue') queue: string
  ) {
    const season = episode + '-' + act;
    const playerSummary = await this.playerService.getPlayerSeasonWeaponSummary(name, tag, season, queue);
    return playerSummary;
  }

  @Get('seasonMapStat')
  async getSeasonMapStatByPlayerNameTagQueue(
    @Query('name') name: string,
    @Query('tag') tag: string,
    @Query('episode') episode: string,
    @Query('act') act: string,
    @Query('queue') queue: string
  ) {
    const season = episode + '-' + act;
    const playerSummary = await this.playerService.getPlayerSeasonMapSummary(name, tag, season, queue);
    return playerSummary;
  }

  @Get('search')
  async searchPlayersByName(
    @Query('name') name: string,
  ) {
    const searchResult = await this.playerService.searchPlayersByName(name);
    return searchResult;
  }
}
