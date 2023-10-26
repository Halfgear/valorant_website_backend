import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
  } from 'typeorm';

@Entity('user_rso', { schema: 'public' })
export class UserRso {
    @PrimaryColumn({ name: 'player_id', unique: true })
    playerId: string;

    @Column({ name: 'is_rso_ed', default: false })
    isRSOed: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
  