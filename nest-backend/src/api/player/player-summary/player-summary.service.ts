import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiotService } from 'src/api/riot/riot.service';
import { PlayerSummary } from './schemas/player-summary.schema';


@Injectable()
export class PlayerSummaryService {
    constructor(
        @InjectModel(PlayerSummary.name, 'valorant')
        private playerSummaryModel: Model<PlayerSummary>,
        private riotService: RiotService,
    ) { }

    // 일년 이상된 매치를 걸러줍니다.
    async filterRecentGames(playerSummary) {
        // 플레이어 요약 정보가 없으면 null 반환
        if (!playerSummary) {
            return null;
        }

        // 최근 게임 목록 필터링 및 중복 제거
        const oneYearBeforeTimestampMs = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
        const recentMatchIds = playerSummary.recent_games ? [...new Set(
            playerSummary.recent_games
                .reverse()  // 최근 게임부터 정렬
                .filter((match) => match?.timestamp >= oneYearBeforeTimestampMs)  // 1년 이내 게임만 선택
                .map((m) => m.match_id)  // 게임 ID 추출
        )] : [];

        // 게임 목록이 비어있으면 빈 배열 반환
        if (recentMatchIds.length === 0) {
            return { ...playerSummary, recent_games: [] };
        }

        // 최근 게임 목록 업데이트 (필터링 적용)
        let recentMatches = recentMatchIds.length === playerSummary.recent_games.length ?
            playerSummary.recent_games :
            recentMatchIds.map((match_id) =>
                playerSummary.recent_games.find((m) => m.match_id === match_id));

        // 최종적으로 업데이트된 플레이어 요약 정보 반환
        return { ...playerSummary, recent_games: recentMatches };
    }
    //플레이어 아이디기반으로 찾습니다.
    async findOneByPlayerId(playerId: string): Promise<any> {
        const playerSummary = await this.playerSummaryModel.findOne(
            { _id: playerId },
            { recent_games: { $slice: -20 } }
        ).lean();

        return this.filterRecentGames(playerSummary);
    }

    async findOneByPlayerNameTag(name: string, tag: string): Promise<any> {
        // 공백 제거 및 소문자로 변환하여 플레이어 이름 생성
        const lowerTag = tag.toLowerCase();
        const playerNameToSearch = name.replace(/\s/g, '').toLowerCase() + '#' + lowerTag;

        // 해당 이름과 태그를 가진 플레이어 요약 정보 검색
        let playerSummaries = await this.playerSummaryModel.find({
            player_name_for_search: playerNameToSearch
        }, {
            recent_games: { $slice: -20 }
        }).lean();


        // 검색된 요약 정보가 없으면 undefined 반환
        if (!playerSummaries || playerSummaries.length === 0) {
            return undefined;
        }

        // 첫 번째 요약 정보 선택 (중복 닉네임+태그가 있을 수도 있음)
        let playerSummary = playerSummaries[0];
        // 동일 이름의 플레이어가 여러 개 있을 경우
        if (playerSummaries.length > 1) {
            // 마지막 업데이트된 순으로 정렬
            playerSummaries.sort((a, b) => (b.last_updated ? b.last_updated : 0) - (a.last_updated ? a.last_updated : 0));
            playerSummary = playerSummaries[0];

            // 나머지 플레이어 요약 정보에 대해 이름과 태그 업데이트
            playerSummaries.forEach(async (ps) => {
                try {
                    const accountDTO = await this.riotService.getAccountByPuuid(ps._id);
                    let gameName = accountDTO.gameName;
                    let tagLine = accountDTO.tagLine;
                    let id = accountDTO.puuid
                    await this.updatePlayerNameTag(id, gameName, tagLine);
                }
                catch (e) {
                    console.log(e)  // 오류 로깅
                }
            });
        }
        // 최근 게임 필터링 적용하여 반환
        return this.filterRecentGames(playerSummary);
    }

    async updatePlayerNameTag(id: string, name: string, tag: string): Promise<void> {
        const lowerTag = tag.toLowerCase();
        const playerNameToSearch = name.replace(/\s/g, '').toLowerCase() + '#' + lowerTag;
        await this.playerSummaryModel.updateOne(
            {
                _id: id,
            },
            {
                player_name: name,
                player_tag: tag,
                player_name_for_search: playerNameToSearch,
            }
        ).exec();
    }

    async searchPlayersByGameName(gameName: string): Promise<any> {
        const regex = new RegExp(`^${gameName}`, 'i'); // Case insensitive search starting from the beginning
        const players = await this.playerSummaryModel.find({ player_name: { $regex: regex } })
            .select('player_name player_tag region tier')
            .limit(5)
            .exec();

        if (!players || players.length === 0) {
            return undefined;
        }

        return players;
    }


    async getRecentMatchesFromPlayerSummary(puuid: string, page: number): Promise<any[]> {
        const itemsPerPage = 20; // Define how many items you want per page
    
        const playerSummary = await this.playerSummaryModel
            .findOne({ _id: puuid })
            .lean();
    
        if (!playerSummary) {
            throw new NotFoundException(`player summary not found`);
        }
    
        const oneYearBeforeTimestampMs = Math.floor(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
    
        // Filter and keep whole match objects
        const recentMatches = playerSummary.recent_games
            ? playerSummary.recent_games
                .filter((match) => match?.timestamp >= oneYearBeforeTimestampMs)
            : [];
    
        // Sort matches by timestamp in descending order
        recentMatches.sort((a, b) => b.timestamp - a.timestamp);
    
        // Calculate starting index for slicing
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
    
        // Slice the array for pagination
        const paginatedMatches = recentMatches.slice(startIndex, endIndex);
        return paginatedMatches;
    }
    

}
