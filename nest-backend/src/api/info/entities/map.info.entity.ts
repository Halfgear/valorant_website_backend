import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';

  @Entity('map_info', { schema: 'public' })
  export class MapInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'map_id', length: 46, unique: true })
    mapId: string;
  
    @Column('character varying', { name: 'name_us', length: 20, nullable: true})
    nameUs: string;

    @Column('character varying', { name: 'name_kr', length: 20, nullable: true})
    nameKr: string;
  
    @Column({ type: 'bool', nullable:true })
    isRotation: boolean;
  }
  