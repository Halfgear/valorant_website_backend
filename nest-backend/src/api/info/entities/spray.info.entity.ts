import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

@Entity('spray_info', { schema: 'public' })
export class SprayInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'spray_id', length: 46 })
    sparyId: string;
  
    @Column('character varying', { name: 'name_kr', length: 256 })
    nameKr: string;
  
    @Column('character varying', { name: 'name_us', length: 256, nullable: true })
    nameUs: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column('text', { name: 'asset_name', nullable: true })
    assetName: string | null;
}
