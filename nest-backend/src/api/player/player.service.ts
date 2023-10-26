import { Injectable } from '@nestjs/common';
import { SeasonIdDict } from 'src/enums/season.const';
import { WeaponDict } from 'src/enums/weapon.enum';
import { InfoService } from '../info/info.service';
import { RsoService } from '../rso/rso.service';
import { PlayerSummaryService } from './player-summary/player-summary.service';

@Injectable()
export class PlayerService {
    constructor(
        private readonly playerSummaryService: PlayerSummaryService,
        private readonly rsoService: RsoService,
        private readonly infoService: InfoService
    ) { }


    async getPlayerSummaryByPlayerNameTag(name: string, tag: string) {
        let playerSummary =
            await this.playerSummaryService.findOneByPlayerNameTag(name, tag);

        return playerSummary
    }

    async getPlayerBasicInfo(name: string, tag: string) {
        const summaryRes = await this.playerSummaryService.getBasicInfoByPlayerNameTag(name, tag);

        if (!summaryRes) {
            return undefined; // Handle the case where no player summary is found
        }

        const player_id = await this.playerSummaryService.getPlayerIdByPlayerNameTag(name, tag);
        const rsoBool = await this.rsoService.checkIfRso(player_id);

        summaryRes.playerInfo.isRSOed = rsoBool;

        return summaryRes;
    }

    async getPlayerSeasonSummary(name: string, tag: string, season: string, queue: string): Promise<any> {
        const playerSummary = await this.playerSummaryService.findOneByPlayerNameTag(name, tag);
        const seasonId = SeasonIdDict[season];
        const seasonSummary = playerSummary[seasonId][queue];
        if (!seasonSummary) {
            return undefined;
        }
        const playerStat = this.parsePlayerStat(seasonSummary);
        const weaponStat = this.formatWeaponStat(seasonSummary);
        const agentStat = await this.formatAgentStat(seasonSummary);
        const mapStat = await this.formatMapStat(seasonSummary);
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

    private async formatAgentStat(seasonSummary) {
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

        return agents;
    }

    private formatWeaponStat(seasonSummary) {
        if (!seasonSummary || !seasonSummary['weapons']) {
            return undefined;
        }

        const weaponPerformances = seasonSummary['weapons'];
        const renamedWeaponPerformances = {};

        for (const weaponId in weaponPerformances) {
            if (weaponPerformances.hasOwnProperty(weaponId)) {
                console.log(weaponId);
                const newKey = WeaponDict[weaponId] || 'Unknown Weapon';
                renamedWeaponPerformances[newKey] = weaponPerformances[weaponId];
            }
        }

        return renamedWeaponPerformances;
    }



    private async formatMapStat(seasonSummary) {
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

        return renamedMapPerformances;
    }



}
