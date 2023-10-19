// player-leaderboard.entity.ts
import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Entity } from 'typeorm';

@Index(["gameName"])
@Entity('player_search')
export class PlayerSearch {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'player_id', length: 128, unique:true })
  playerId: string;

  @Column('integer', { name: 'region_id' })
  regionId: number;

  @Column({ type: 'bool',name:'is_RSOed', default: false })
  isRSOed: boolean;

  @Column({ name: 'game_name' })
  gameName: string;

  @Column({ name: 'tag_line' })
  tagLine: string;

  @Column('integer', { name: 'tier' })
  tier: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
