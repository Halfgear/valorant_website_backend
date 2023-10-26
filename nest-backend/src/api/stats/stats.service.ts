import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PSTier } from 'src/enums/ps.tier.enum';
import { In, Repository } from 'typeorm';
import { DifficultyService } from '../difficulty/difficulty.service';
import { InfoService } from '../info/info.service';
import { AgentStats } from './entities/agent.stat.entity';
import { MapAgentStats } from './entities/map-agent.stat.entity';
import { MapStats } from './entities/map.stat.entity';

type AgentStat = {
    pickRate: number;
    winRate: number;
    psScore: number;
    tier: number;
    agentId: string;
    mapId: string;
    positionId: number;
    difficulty: number;
};

type StatsDictionary = {
    [key: string]: AgentStat;
};


@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(MapAgentStats)
        private readonly mapAgentRepository: Repository<MapAgentStats>,
        @InjectRepository(MapStats)
        private readonly mapRepository: Repository<MapStats>,
        @InjectRepository(AgentStats)
        private readonly agentRepository: Repository<AgentStats>,
        private readonly infoService: InfoService,
        private readonly difficultyService: DifficultyService
    ) { }

    async getRotationMapWinRates(): Promise<MapStats[]> {
        const rotationMapIds = await this.infoService.getRotationMapIds()
        return await this.mapRepository.find({
            where: {
                mapId: In(rotationMapIds), // This uses the In operator from TypeORM
            },
            select: {
                mapId: true,
                atkWinRate: true,
                defWinRate: true
            },
        });
    }
    async getAgentsStatsByMapTier(mapName: string, tier: string) {
        //스트링 티어를 enum으로 변경
        const tierValue = PSTier[tier as keyof typeof PSTier];

        const result = await this.mapAgentRepository
            .createQueryBuilder('mapAgent')
            .select([
                'mapAgent.id',
                'mapAgent.pickRate',
                'mapAgent.winRate',
                'mapAgent.tier',
                'mapAgent.ps_score',
                'mapAgent.kill',
                'mapAgent.death',
                'mapAgent.assist',
                'mapAgent.psScore',
                'mapAgent.psTier',
                'agent.agentId'
            ])
            .innerJoin('mapAgent.agent', 'agent')
            .innerJoin('mapAgent.map', 'map')
            .where('mapAgent.tier = :tierValue', { tierValue })
            .andWhere('map.name = :mapName', { mapName })  // Use map's name for filtering
            .getMany();
        const positionDict = await this.infoService.getAgentPositionsDictionary()
        const cleanedResults = result.map(row => {
            return {
                id: row.id,
                agentId: row.agent.agentId,
                positionId: positionDict[row.agent.agentId],
                //기존 Tier는 필터링에만 쓰고, 이건 저희 기준으로 나눈 티어입니다.
                tier: row.psTier,
                pickRate: row.pickRate,
                winRate: row.winRate,
                psScore: row.psScore,
                kill: row.kill,
                death: row.death,
                assist: row.assist
            };
        });

        return cleanedResults;
    }

    async getAgentStats(): Promise<MapAgentStats[]> {
        const ret = await this.mapAgentRepository.createQueryBuilder('mapAgent')
            .select(['mapAgent.id', 'mapAgent.pickRate', 'mapAgent.winRate', 'mapAgent.psScore', 'mapAgent.psTier', 'agent.agentId', 'map.mapId'])
            .leftJoin('mapAgent.agent', 'agent')
            .leftJoin('mapAgent.map', 'map')
            .where('mapAgent.tier = :tier', { tier: 0 })
            .getMany();
        return ret;
    }

    async getCombinedStats(): Promise<{ [key: string]: any }> {
        const ret = await this.getAgentStats();
        const positionDict = await this.infoService.getAgentPositionsDictionary()
        const difficultyDict = await this.difficultyService.getDifficultyDictionary()
        // Transforming the array to a dictionary format
        const result: { [key: string]: any } = {};
        for (const agent of ret) {
            const agentId = agent.agent.agentId
            const output = {}
            output["id"] = agent.id;
            output["pickRate"] = agent.pickRate;
            output["winRate"] = agent.winRate;
            output["tier"] = agent.psTier;
            output["psScore"] = agent.psScore;
            output["agentId"] = agentId;
            output["mapId"] = agent.map.mapId;
            output["positionId"] = positionDict[agentId]
            output["difficulty"] = difficultyDict[agentId]
            result[agent.id] = output;
        }
        return result;
    }

    async getTopAgentsForAllRotationMaps(): Promise<any> {
        const data = await this.getCombinedStats();
        const mapIds = await this.infoService.getRotationMapIds();
        const result = {};
        for (const mapId of mapIds) {
            result[mapId] = this.compileTopAgentsForMap(data, mapId);
        }
        result["updatedAt"] = new Date();
        return result;
    }

    compileTopAgentsForMap(stats: StatsDictionary, mapId: string) {
        return {
            duelists: this.getTopPSScoresByPosition(stats, 1, mapId),
            initiators: this.getTopPSScoresByPosition(stats, 2, mapId),
            sentinels: this.getTopPSScoresByPosition(stats, 3, mapId),
            controllers: this.getTopPSScoresByPosition(stats, 4, mapId)
        };
    }

    // 전체 dictionary에서 맵과 요원 포지션으로 걸러서 psScore 탑 3로 걸러옵니다.
    getTopPSScoresByPosition(stats: StatsDictionary, positionId: number, mapId: string) {
        return Object.values(stats)
            .filter(agent => agent.positionId === positionId && agent.mapId === mapId)
            .map(agent => {
                const copy = { ...agent };
                delete copy.mapId;
                return copy;
            })
            .sort((a, b) => b.psScore - a.psScore)
            .slice(0, 3);
    }

}
