import {
    Entity,
    Column,
    PrimaryColumn
} from 'typeorm';


@Entity('agent_difficulty', { schema: 'public' })
export class Difficulty {
    @PrimaryColumn('character varying', { name: 'agent_id', length: 46 })
    agentId: string;

    @Column({ nullable: true })
    difficulty: number;
}
