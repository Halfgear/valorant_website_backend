// player-leaderboard.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leaderboards')
export class Leaderboard {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column({ name: 'game_name' })
    gameName: string;

    @Column({ name: 'tag_line' })
    tagLine: string;

    @Column({ name: 'player_id', unique: true })
    playerId: string;

    //1은 한국서버를 뜻합니다
    @Column('integer', { name: 'region_id', default: 1 })
    regionId: number;

    @Column({ name: 'is_rso_ed', default: false })
    isRSOed: boolean;

    //등수
    @Column({ type: 'integer' })
    rank: number;

    @Column({ default: 0 })
    tier: number;

    @Column({ default: 1 })
    level: number;

    @Column('character varying', { name: 'player_card_id', length: 46 })
    playerCardId: string;

    @Column({ type: 'integer' })
    rating: number;


    @Column({ default: 0 })
    win: number;

    @Column({ default: 0 })
    draw: number;

    @Column({ default: 0 })
    lose: number;

    @Column({ type: 'integer', name: 'average_combat_score', default: 0 })
    averageCombatScore: number;

    @Column({ name: 'main_position', default: 'None' })
    mainPosition: string;

    @Column('text', { array: true, name: 'main_agent_ids' })
    mainAgentIds: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
