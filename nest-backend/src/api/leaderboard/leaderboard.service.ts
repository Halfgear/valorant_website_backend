// leaderboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { PlayerLeaderboard } from './entities/player.leaderboard.entity';
import { RegionNameId } from './enums/region.enum';

@Injectable()
export class LeaderboardService {
    constructor(
        @InjectRepository(PlayerLeaderboard)
        private playerLeaderboardRepository: Repository<PlayerLeaderboard>,
    ) { }
    async getRankers(query: PaginateQuery, region: string): Promise<any> {
        const regionId: number = RegionNameId[region];
        const dateId = (
            await this.playerLeaderboardRepository.find({
                select: {
                    dateId: true,
                },
                order: {
                    dateId: 'DESC',
                },
                where: {
                    regionId: regionId,
                },
                take: 1,
            })
        )[0].dateId;
        const whereOption = {
            regionId: regionId,
            dateId,
        };
        let res = await paginate(query, this.playerLeaderboardRepository, {
            sortableColumns: ['rank'],
            select: [
                'gameName',
                'tagLine',
                'profileId',
                'rank',
                'rating',
                'tier',
                'isRSOed',
                'wins',
                'losses',
                'mainPositionId',
                'mainAgentIds',
                'averageCombatScore',
            ],
            defaultSortBy: [['rank', 'ASC']],
            defaultLimit: 50,
            where: whereOption,
        });
        return res
    }
}
