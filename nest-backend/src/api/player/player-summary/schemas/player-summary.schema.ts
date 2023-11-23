import { Accuracy, AgentStats, MapStats, Position, Weapon } from '../interfaces/stat.interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

interface GameSummary {
    match_id: string;
    queue_id: string;
    character_id: string;
    map_id: string;
    position: string;
    kills: number;
    deaths: number;
    assists: number;
    result: string;
    average_combat_score: number;
    timestamp: number;
    playtimeMilis: number;
    roundsWon: number;
    roundsLost: number;
}

interface PlayerStat {
    accuracy: Accuracy;
    agents: Record<string, AgentStats>;
    best_tier: number;
    aceCount: number;
    bombDefused: number;
    bombPlanted: number;
    clutchCount: number;
    clutchVS1: number;
    clutchVS2: number;
    clutchVS3: number;
    clutchVS4: number;
    clutchVS5: number;
    tradeKills: number;
    tradedDeaths: number;
    roundsPlayed: number;
    kills: number;
    deaths: number;
    assists: number;
    counts: number;
    wins: number;
    losses: number;
    maps: Record<string, MapStats>;
    positions: Record<string, Position>;
    tier: number;
    totalAverageCombatScore: number;
    weapons: Record<string, Weapon>;
    playtimeMills: number;
}

@Schema({ collection: 'summary' })
export class PlayerSummary {
    @Prop()
    _id: string;

    @Prop()
    puuid: string;

    @Prop()
    region: string;

    @Prop()
    player_name: string;

    @Prop()
    player_name_for_search: string;

    @Prop()
    player_tag: string;

    @Prop({
        type: mongoose.Schema.Types.Mixed,
        required: false,
    })
    season_id: Record<string, PlayerStat>;

    @Prop()
    account_level: number;

    @Prop()
    tier: number;

    @Prop()
    best_tier: number;

    @Prop()
    last_game_timestamp: number;

    @Prop()
    last_updated: number;

    @Prop()
    player_card: string;

    @Prop({
        type: mongoose.Schema.Types.Mixed,
        required: false,
    })
    recent_games: GameSummary[];
}

export const playerSummarySchema = SchemaFactory.createForClass(PlayerSummary);