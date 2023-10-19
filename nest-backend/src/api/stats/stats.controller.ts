import { Controller, Get, Query } from '@nestjs/common';
import { AgentStats } from './entities/agent.stat.entity';
import { MapStats } from './entities/map.stat.entity';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('mapWinRates')
    async getRotationMapWinRates(): Promise<MapStats[]> {
        return this.statsService.getRotationMapWinRates();
    }

    @Get('mapAgentStats')
    async getTopAgentsForAllRotationMaps(): Promise<AgentStats[]> {
        return this.statsService.getTopAgentsForAllRotationMaps();
    }

    /**
     * 
     * @param map 맵 ID입니다
     * @param tier : Low, Mid, High중에 하나여야 합니다. 티어구분을 받습니다.
     * @returns 맵, 티어에 맞는 모든 요원의 통계를 보냅니다.
     */
    @Get('mapTierStats')
    async getAgentsWithMapTier(@Query('map') mapName: string, @Query('tier') tier: string){
        return this.statsService.getAgentsStatsByMapTier(mapName.charAt(0).toUpperCase() + mapName.slice(1), tier);
    }

}

