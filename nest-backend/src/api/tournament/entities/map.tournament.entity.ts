import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Composition } from "./composition.entity";

@Entity('map_tournament')
@Index(['mapId'])
export class MapTournament {
    @PrimaryColumn({ name: 'map_id', unique: true })  
    mapId: string;

    @OneToMany(() => Composition, composition => composition.map)
    compositions: Composition[];
}