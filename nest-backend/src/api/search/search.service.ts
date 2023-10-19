import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerSearch } from './entities/player.search.entity';
import { Tier } from './enums/tier.enum';
import { PlayerSearchOutput, PlayerSearchWithTierName } from './types/player.type';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(PlayerSearch)
        private readonly playerSearchRepository: Repository<PlayerSearch>,
    ) { }

    /**
     * 검색기능 자동완성 기능입니다.
     * @param name 플레이어의 이름 앞부분
     * @returns 이름 앞부분이 일치하는 최대 다섯명의 플레이어 리스트
     */
    async getPlayersAutoComplete(name: string): Promise<PlayerSearchOutput[]> {
        const players = await this.playerSearchRepository
            .createQueryBuilder('player_search')
            .where('player_search.gameName ILIKE :name', { name: `${name}%` })
            .andWhere('player_search.is_RSOed = :isRSOed', { isRSOed: true })
            .orderBy('player_search.gameName', 'ASC')
            .take(5)
            .getMany();

        return players.map(player => {
            const playerWithTierName: PlayerSearchWithTierName = { ...player, tier: Tier[player.tier] };
            const { id, isRSOed, createdAt, updatedAt, regionId, ...rest } = playerWithTierName;
            return rest;
        });
    }
}
