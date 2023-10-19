// player-leaderboard.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Index('player_leaderboards_unique', ['regionId', 'playerId', 'dateId'], {
  unique: true,
})
@Index(['regionId', 'dateId', 'mainPositionId'])
@Entity('player_leaderboards')
export class PlayerLeaderboard {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'region_id' })
  regionId: number;

  @Column('character varying', { name: 'player_id', length: 128 })
  playerId: string;

  @Column({ name: 'profile_id' })
  profileId: string;

  @Column({ type: 'bool',name:'is_RSOed', default:false })
  isRSOed: boolean;

  @Column({ name: 'game_name' })
  gameName: string;

  @Column({ name: 'tag_line' })
  tagLine: string;

  //등수
  @Column({ type: 'integer' })
  rank: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column('character varying', { name: 'tier', length: 10 })
  tier: string;

  @Column({ type: 'integer' })
  games: number;

  @Column({ type: 'integer' })
  wins: number;

  @Column({ type: 'integer' })
  losses: number;

  @Column({ type: 'integer', name: 'average_combat_score' })
  averageCombatScore: number;

  @Column({ type: 'integer', name: 'main_position_id' })
  mainPositionId: number;

  @Column('text', { array: true, name: 'main_agent_ids' })
  mainAgentIds: string[];

  @Column('integer', { name: 'date_id' })
  dateId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
