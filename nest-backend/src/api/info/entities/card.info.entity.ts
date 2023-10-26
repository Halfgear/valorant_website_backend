import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';

@Entity('card_info', { schema: 'public' })
export class CardInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('character varying', { name: 'card_id', length: 46, unique: true })
    cardId: string;
  
    @Column('character varying', { name: 'name_kr', length: 256 })
    nameKr: string;
  
    @Column('character varying', { name: 'name_us', length: 256, nullable: true })
    nameUs: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column('text', { name: 'asset_name', nullable: true })
    assetName: string | null;
}
