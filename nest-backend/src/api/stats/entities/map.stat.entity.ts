import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Index
  } from 'typeorm';
  import { MapAgentStats } from './map-agent.stat.entity';
  
  @Entity('map_stats', { schema: 'public' })
  export class MapStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'map_id', length: 46, unique: true })
    mapId: string;
  
    @Column()
    name: string;
  
    @OneToMany(() => MapAgentStats, (ams) => ams.map)
    agentStats: MapAgentStats[];

    @Column({ name: 'def_win_rate', type: 'real', default:0 })
    defWinRate: number;

    @Column({ name: 'atk_win_rate', type: 'real', default:0 })
    atkWinRate: number;
  }
  