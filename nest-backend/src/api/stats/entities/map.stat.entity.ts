import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Index
  } from 'typeorm';
  import { MapAgentStats } from './map-agent.stat.entity';
  
  @Entity('map_stats', { schema: 'public' })
  @Index(['name'])
  export class MapStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'map_id', length: 46, unique: true })
    mapId: string;
  
    @Column()
    name: string;
  
    @OneToMany(() => MapAgentStats, (ams) => ams.map)
    agentStats: MapAgentStats[];

    @Column({ type: 'real' })
    defWinRate: number;

    @Column({ type: 'real' })
    atkWinRate: number;
  }
  