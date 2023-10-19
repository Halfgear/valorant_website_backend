import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

@Entity('item_info', { schema: 'public' })
  export class WeaponInfo {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('character varying', { name: 'weapon_id', length: 46 })
    weaponId: string;
    
    @Column('character varying', { name: 'name_kr', length: 256 })
    nameKr: string;
  
    @Column('character varying', { name: 'name_us', length: 256, nullable: true })
    nameUs: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    @Column('integer', { name: 'price', nullable: true })
    price: number | null;
  
    @Column('text', { name: 'desc_kr', nullable: true })
    descKr: string | null;
  
    @Column('text', { name: 'desc_us', nullable: true })
    descUs: string | null;
}
