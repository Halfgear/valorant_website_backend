import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
  } from 'typeorm';
  import { MapAgentStats } from './map-agent.stat.entity';
  
  @Entity('agent_stats', { schema: 'public' })
  export class AgentStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'agent_id', length: 46, unique: true })
    agentId: string;
  
    @Column()
    name: string;

    @Column({ type: 'real' , name: 'pick_rate'})
    pickRate: number;

    @Column({ type: 'real' , name: 'win_rate'})
    winRate: number;
  
    @OneToMany(() => MapAgentStats, (ams) => ams.agent)
    mapStats: MapAgentStats[];
  }
  