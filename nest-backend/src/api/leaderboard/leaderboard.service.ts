import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegionNameId } from 'src/enums/region.enum';
import { Tier } from 'src/enums/tier.enum';
import { Repository } from 'typeorm';
import { Leaderboard } from './entities/leaderboard.entity';
type rsoCheck = { found: boolean; isRSOed?: boolean; };

@Injectable()
export class LeaderboardService {
    constructor(
        @InjectRepository(Leaderboard)
        private leaderboardRepository: Repository<Leaderboard>,
    ) { }

    async getRankers(page: number, region: string): Promise<any> {
        const regionId: number = RegionNameId[region];

        if (page < 1 || page > 4) {
            throw new Error('Invalid page number');
        }

        const rankStart = (page - 1) * 50 + 1;
        const rankEnd = page * 50;

        const queryBuilder = this.leaderboardRepository
            .createQueryBuilder('playerLeaderboard')
            .leftJoinAndSelect('playerLeaderboard.player', 'player')
            .leftJoinAndSelect('player.playerStat', 'playerStat')
            .where('player.regionId = :regionId', { regionId })
            .andWhere('playerLeaderboard.rank BETWEEN :rankStart AND :rankEnd', { rankStart, rankEnd })
            .orderBy('playerLeaderboard.rank', 'ASC')
            .select([
                'player.playerId',
                'player.gameName',
                'player.tagLine',
                'player.isRSOed',
                'player.tier',
                'player.level',
                'player.playerCardId',
                'playerLeaderboard.rank',
                'playerLeaderboard.rating',
                'playerLeaderboard.mainPosition',
                'playerLeaderboard.mainAgentIds',
                'playerStat.averageCombatScore',
                'playerStat.win',
                'playerStat.lose',
                'playerStat.draw'
            ]);

        const result = await queryBuilder.getMany();

        // Transform the result, for example converting tier enums to strings
        result.forEach((player: any) => {
            player.tier = Tier[player.tier];
        });

        return result;
    }

}
