import { Injectable, NotFoundException } from '@nestjs/common';
import { SeasonIdDict } from 'src/enums/season.const';
import { Tier } from 'src/enums/tier.enum';
import { WeaponDict } from 'src/enums/weapon.enum';
import { InfoService } from '../info/info.service';
import { MatchStatusService } from '../match/status/match-status.service';
import { RiotService } from '../riot/riot.service';
import { RsoService } from '../rso/rso.service';
import { PlayerSummaryService } from './player-summary/player-summary.service';

@Injectable()
export class PlayerService {
    constructor(
        private readonly playerSummaryService: PlayerSummaryService,
        private readonly rsoService: RsoService,
        private readonly riotService: RiotService,
        private readonly infoService: InfoService,
        private readonly matchStatusService: MatchStatusService,
    ) { }

    async putPlayerRso(name: string, tag: string, rso: boolean) {
        const summary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        const playerId = summary.puuid
        if (!playerId) {
            return 'player not found';
        }
        const updateRso = await this.rsoService.updateRsoStatus(playerId, rso);
        if (!updateRso) {
            return `update failed`
        }
        return `${name} rso status is now ${rso}`
    }

    async checkRso(name: string, tag: string) {
        const summary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        const playerId = summary.puuid
        let status = true;

        if (playerId === undefined) {
            status = null
        }
        if (!await this.rsoService.checkIfRso(playerId)) {
            status = false
        }
        const ret = {
            rso: status
        }
        return ret
    }

    async getPlayerBasicInfo(name: string, tag: string) {
        const summaryRes = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);

        if (!summaryRes) {
            return undefined;
        }
        const res = {
            playerInfo: {
                puuid: summaryRes.puuid,
                gameName: summaryRes.player_name,
                tagLine: summaryRes.player_tag,
                playerCard: summaryRes.player_card,
                updatedAt: summaryRes.last_updated,
                level: summaryRes.account_level,
                region: summaryRes.region,
                tier: Tier[summaryRes.tier]
            }
        }

        const player_id = res.playerInfo.puuid;
        const rsoBool = await this.rsoService.checkIfRso(player_id);

        delete res.playerInfo.puuid;
        summaryRes.playerInfo.isRSOed = rsoBool;

        return summaryRes;
    }

    async refreshMatchList(puuid: string) {
        const oneYearBeforeTimestamp = Math.floor(new Date().getTime() / 1000 - 365 * 24 * 60 * 60);
        const matchApiOutput = await this.riotService.getMatchesByPuuid(puuid);
        const matchHistories = matchApiOutput.history;

        const playerSummary = await this.playerSummaryService.findOneByPlayerId(puuid);
        if (!playerSummary) {
            throw new NotFoundException('summoner summary not found');
        }

        const newMatchIds = [];
        const oneYearBeforeTimestampMs = oneYearBeforeTimestamp * 1000;
        const recentMatchIds = playerSummary.recent_games
            .filter((match: any) => match?.timestamp >= oneYearBeforeTimestampMs)
            .map((match: any) => match.match_id);

        const matchIdToQueueId = {};
        matchHistories.forEach((match: any) => {
            matchIdToQueueId[match.matchId] = match.queueId;

            if (!recentMatchIds.includes(match.matchId) &&
                (match.queueId === 'competitive' || match.queueId === 'unrated')) {
                newMatchIds.push(match.matchId);
            }
        });
        await Promise.all(
            newMatchIds.map((matchId) => {
                return this.matchStatusService.undateMatchStatusToNotCollected(matchId);
            }),
        );
        return newMatchIds.map((matchId) => {
            return {
                match_id: matchId,
                queue_id: matchIdToQueueId[matchId] // Include queueId in the output
            };
        });
    }

    async getRecentMatchesFromPlayerSummary(
        puuid: string,
        page: number,
    ): Promise<any[]> {
        return this.playerSummaryService.getRecentMatchesFromPlayerSummary(
            puuid,
            page,
        );
    }

    /**
     * 시즌/큐 전체의 요원 요약을 가져옵니다.
     */
    async getPlayerSeasonAgentSummary(name: string, tag: string, season: string, queue: string): Promise<any> {
        const seasonId = SeasonIdDict[season];
        const playerSummary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        if (!playerSummary) {
            return undefined;
        }
        const agents = playerSummary[seasonId][queue]['agents'];
        const positionDict = await this.infoService.getAgentPositionsDictionary();
        for (const agentId in agents) {
            if (agents.hasOwnProperty(agentId)) {
                agents[agentId]['positionId'] = positionDict[agentId] || 'Unknown Position';
            }
        }
        return agents;
    }

    /**
     * 시즌/큐 전체의 맵 요약을 가져옵니다.
     */
    async getPlayerSeasonMapSummary(name: string, tag: string, season: string, queue: string): Promise<any> {
        const seasonId = SeasonIdDict[season];
        const playerSummary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        if (!playerSummary) {
            return undefined;
        }
        const mapPerformances = playerSummary[seasonId][queue]['maps'];
        const mapDict = await this.infoService.getMapIdDictionary();
        const renamedMapPerformances = {};
        for (const mapId in mapPerformances) {
            if (mapPerformances.hasOwnProperty(mapId)) {
                const newKey = mapDict[mapId] || 'Unknown Map';
                renamedMapPerformances[newKey] = mapPerformances[mapId];
            }
        }
        return renamedMapPerformances;
    }

    /**
     * 시즌/큐 전체의 무기 요약을 가져옵니다.
     */
    async getPlayerSeasonWeaponSummary(name: string, tag: string, season: string, queue: string): Promise<any> {
        const seasonId = SeasonIdDict[season];
        const playerSummary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        if (!playerSummary) {
            return undefined;
        }
        const weaponPerformances = playerSummary[seasonId][queue]['weapons'];
        const renamedWeaponPerformances = {};
        for (const weaponId in weaponPerformances) {
            if (weaponPerformances.hasOwnProperty(weaponId)) {
                const newKey = WeaponDict[weaponId] || 'Unknown Weapon';
                renamedWeaponPerformances[newKey] = weaponPerformances[weaponId];
            }
        }
        return renamedWeaponPerformances;
    }

    async getPlayerSeasonSummary(name: string, tag: string, season: string, queue: string): Promise<any> {
        const playerSummary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        const seasonId = SeasonIdDict[season];
        const seasonSummary = playerSummary[seasonId][queue];
        if (!seasonSummary) {
            return undefined;
        }
        const playerStat = this.parsePlayerStat(seasonSummary);
        const weaponStat = this.formatTopFiveWeaponStat(seasonSummary);
        const agentStat = await this.formatTopFiveAgentsStat(seasonSummary);
        const mapStat = await this.formatTopFiveMapStat(seasonSummary);
        const res = {
            playerStat: playerStat,
            accuracy: seasonSummary.accuracy,
            playedPosition: seasonSummary.positions,
            agentPerformance: agentStat,
            weaponPerformance: weaponStat,
            mapPerformance: mapStat
        }
        return res;
    }

    private parsePlayerStat(seasonSummary) {
        if (!seasonSummary) {
            return undefined;
        }
        const res = {
            tier: seasonSummary.tier,
            wins: seasonSummary.wins,
            draws: seasonSummary.counts - seasonSummary.losses - seasonSummary.wins,
            losses: seasonSummary.losses,
            kills: seasonSummary.kills,
            deaths: seasonSummary.deaths,
            assists: seasonSummary.assists,
            bombPlanted: seasonSummary.bombPlanted,
            bombDefused: seasonSummary.bombDefused,
            clutchCount: seasonSummary.clutchCount,
            aceCount: seasonSummary.aceCount,
            playtimeMilis: seasonSummary.playtimeMilis
        }
        return res;
    }

    /**
     * 제일 많이 플레이된 요원 5명에 포지션 아이디를 달아서 돌려줍니다.
     * @param seasonSummary 
     * @returns 
     */
    private async formatTopFiveAgentsStat(seasonSummary) {
        if (!seasonSummary || !seasonSummary['agents']) {
            return undefined;
        }
        const agents = seasonSummary['agents'];
        const positionDict = await this.infoService.getAgentPositionsDictionary();
        for (const agentId in agents) {
            if (agents.hasOwnProperty(agentId)) {
                agents[agentId]['positionId'] = positionDict[agentId] || 'Unknown Position';
            }
        }
        const agentsArray = Object.keys(agents).map(agentId => ({
            ...agents[agentId]
        }));
        agentsArray.sort((a, b) => b.counts - a.counts);
        const top5Agents = agentsArray.slice(0, 5);
        const top5AgentsObj = Object.fromEntries(
            top5Agents.map(agent => {
                const matchedId = Object.keys(agents).find(id =>
                    JSON.stringify(agents[id]) === JSON.stringify(agent)
                );
                return [matchedId, agent];
            })
        );
        return top5AgentsObj;
    }

    /**
     * 무기 id를 무기 이름으로 변경후, 킬수가 제일 높은 무기 5개만 돌려줍니다.
     * @param seasonSummary 
     * @returns 
     */
    private formatTopFiveWeaponStat(seasonSummary) {
        if (!seasonSummary || !seasonSummary['weapons']) {
            return undefined;
        }
        const weaponPerformances = seasonSummary['weapons'];
        const renamedWeaponPerformances = {};
        for (const weaponId in weaponPerformances) {
            if (weaponPerformances.hasOwnProperty(weaponId)) {
                const newKey = WeaponDict[weaponId] || 'Unknown Weapon';
                renamedWeaponPerformances[newKey] = weaponPerformances[weaponId];
            }
        }
        const weaponsArray = Object.keys(renamedWeaponPerformances).map(weaponName => ({
            ...renamedWeaponPerformances[weaponName]
        }));
        weaponsArray.sort((a, b) => b.kills - a.kills);
        const top5Weapons = weaponsArray.slice(0, 5);
        const top5WeaponsObj = Object.fromEntries(
            top5Weapons.map(weapon => {
                const matchedName = Object.keys(renamedWeaponPerformances).find(name =>
                    JSON.stringify(renamedWeaponPerformances[name]) === JSON.stringify(weapon)
                );
                return [matchedName, weapon];
            })
        );
        return top5WeaponsObj;
    }


    /**
     * 제일 많이 플레이한 맵 5개에 mapId를 mapName으로 변경하여 돌려줍니다.
     * @param seasonSummary 
     * @returns 
     */
    private async formatTopFiveMapStat(seasonSummary) {
        if (!seasonSummary || !seasonSummary['maps']) {
            return undefined;
        }
        const mapDict = await this.infoService.getMapIdDictionary();
        const mapPerformances = seasonSummary['maps'];
        const renamedMapPerformances = {};
        for (const mapId in mapPerformances) {
            if (mapPerformances.hasOwnProperty(mapId)) {
                const newKey = mapDict[mapId] || 'Unknown Map';
                renamedMapPerformances[newKey] = mapPerformances[mapId];
            }
        }
        const mapsArray = Object.keys(renamedMapPerformances).map(mapName => ({
            ...renamedMapPerformances[mapName]
        }));
        mapsArray.sort((a, b) => b.count - a.count);
        const top5Maps = mapsArray.slice(0, 5);
        const top5MapsObj = Object.fromEntries(
            top5Maps.map(map => {
                const matchedName = Object.keys(renamedMapPerformances).find(name =>
                    JSON.stringify(renamedMapPerformances[name]) === JSON.stringify(map)
                );
                return [matchedName, map];
            })
        );
        return top5MapsObj;
    }

    async searchPlayersByName(name: string) {
        const players = await this.playerSummaryService.searchPlayersByGameName(name);
        if (!players) {
            return undefined;
        }
        const ret = players.map(player => {
            return {
                gameName: player.player_name,
                tagLine: player.player_tag,
                region: player.region,
                tier: Tier[player.tier],
            };
        });
        return ret
    }
}
