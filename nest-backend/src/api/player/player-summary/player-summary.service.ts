import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeasonIdDict } from 'src/enums/season.const';
import { PlayerSummary } from './schemas/player-summary.schema';

@Injectable()
export class PlayerSummaryService {
    constructor(
        @InjectModel(PlayerSummary.name, 'valorant')
        private playerSummaryModel: Model<PlayerSummary>
    ) { }

    async findOneByPlayerId(playerId: string): Promise<any> {
        const playerSummary = await this.playerSummaryModel.findOne({
            _id: playerId,
        },
            {
                recent_games: {
                    $slice: -20,
                },
            }
        ).lean()
        if (!playerSummary) {
            return null;
        }
        return playerSummary
    }

    async findOneByPlayerNameTag(name: string, tag: string): Promise<any> {
        const playerNameCombined = name + '#' + tag;
        const playerNameToSearch = playerNameCombined.replace(/\s/g, '').toLowerCase();
        let playerSummary;
        let playerSummaries = await this.playerSummaryModel.find({
            player_name_for_search: playerNameToSearch,
        }).lean()

        if (!playerSummaries || playerSummaries.length === 0) {
            return undefined;
        }
        if (playerSummaries.length > 1) {
            playerSummaries = playerSummaries.sort((a, b) => {
                return (
                    (b.last_updated ? b.last_updated : 0) -
                    (a.last_updated ? a.last_updated : 0)
                );
            });
            playerSummary = playerSummaries[0];
        } else if (playerSummaries.length === 1) {
            playerSummary = playerSummaries[0];
        }
        return playerSummary
    }

    async getPlayerNameByPlayerId(playerId: string): Promise<any> {
        const playerSummary = await this.playerSummaryModel.findOne({
            _id: playerId,
        },
            {
                player_name: true,
            },
        );
        if (playerSummary) {
            return playerSummary;
        } else {
            throw new NotFoundException(
                `Player not found by playerId - ${playerId}`,
            );
        }
    }

    async getPlayerIdByPlayerNameTag(name: string, tag: string): Promise<any> {
        const playerNameCombined = name + '#' + tag;
        const playerNameToSearch = playerNameCombined.replace(/\s/g, '').toLowerCase();
        const playerSummary = await this.playerSummaryModel.findOne({
            player_name_for_search: playerNameToSearch,
        }).lean();

        return playerSummary.puuid
    }

    async getBasicInfoByPlayerNameTag(name: string, tag: string): Promise<any> {
        const playerNameCombined = name + '#' + tag;
        const playerNameToSearch = playerNameCombined.replace(/\s/g, '').toLowerCase();
        const playerSummary = await this.playerSummaryModel.findOne({
            player_name_for_search: playerNameToSearch,
        }).lean()

        if(!playerSummary){
            return undefined;
        }

        const res = {
            playerInfo: {
                gameName: playerSummary.player_name,
                tagLine: playerSummary.player_tag,
                playerCard: playerSummary.player_card,
                updatedAt: playerSummary.last_updated,
                level: playerSummary.account_level,
            }
        }
        return res
    }

}
