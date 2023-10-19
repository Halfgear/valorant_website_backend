// src/team-composition.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    JoinColumn,
} from 'typeorm';
import { MapTournament } from './map.tournament.entity';

@Entity('composition')
@Index(['pickRate'])
export class Composition {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MapTournament, map => map.compositions, { nullable: false, eager: true })
    @JoinColumn({ name: 'map_id' })
    map: MapTournament;

    @Column('json')
    composition: string[];

    @Column({ name: 'pick_rate', type: 'real' })
    pickRate: number;
}
