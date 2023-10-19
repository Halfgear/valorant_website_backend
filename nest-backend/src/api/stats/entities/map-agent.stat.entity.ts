import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Tier } from '../enums/tier.enum';
import { AgentStats } from './agent.stat.entity';
import { MapStats } from './map.stat.entity';

@Index(["tier", "psScore"])
@Entity('map_agent_stats')
export class MapAgentStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => AgentStats,
    (agent) => agent.mapStats
  )
  @JoinColumn({ name: 'agent_id', referencedColumnName: 'agentId' })
  agent: AgentStats;

  @ManyToOne(
    () => MapStats,
    (map) => map.agentStats
  )
  @JoinColumn({ name: 'map_id', referencedColumnName: 'mapId' })
  map: MapStats;

  @Column({
    type: 'enum',
    enum: Tier,
    comment: '0: All, 1: Low(Iron-Gold), 2: Mid(Plat+), 3: High(Immortal+)',
  })
  tier: Tier;

  @Column({ type: 'integer', name: 'ps_tier', comment: 'ps자체 티어', default: 0})
  psTier: number;

  @Column({ type: 'real', name: 'pick_rate', comment: '소수점 두자리' })
  pickRate: number;

  @Column({ type: 'real', name: 'win_rate', comment: '소수점 두자리' })
  winRate: number;

  @Column({ type: 'real', name: 'ps_score', comment: '소수점 두자리' })
  psScore: number;

  @Column({ type: 'real', name: 'kill', comment: '소수점 한자리' })
  kill: number;

  @Column({ type: 'real', name: 'death', comment: '소수점 한자리' })
  death: number;

  @Column({ type: 'real', name: 'assist', comment: '소수점 한자리' })
  assist: number;
}
