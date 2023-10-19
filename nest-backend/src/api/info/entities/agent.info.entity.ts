import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

@Entity('agent_info', { schema: 'public' })
export class AgentInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column('character varying', { name: 'agent_id', length: 46, })
    agentId: string;

    @Column('character varying', { name: 'name_kr', length: 20 })
    nameKr: string;
  
    @Column('character varying', { name: 'name_us', length: 20 })
    nameUs: string;

    @Column({name: 'position_id'})
    positionId: number;
  
    // skills (KR)
    @Column('character varying', { name: 'passive_name_kr', nullable: true , length: 50})
    passiveNameKr: string | null;
  
    @Column('text', { name: 'passive_desc_kr', nullable: true })
    passiveDescKr: string | null;

    @Column('character varying', {
        name: 'z_name_kr',
        nullable: true,
        length: 50,
      })
    zNameKr: string | null;
    
    @Column('text', { name: 'z_desc_kr', nullable: true })
    zDescKr: string | null;
    
    @Column('character varying', {
      name: 'c_name_kr',
      nullable: true,
      length: 50,
    })
    cNameKr: string | null;
  
    @Column('text', { name: 'c_desc_kr', nullable: true })
    cDescKr: string | null;
  
    @Column('character varying', {
      name: 'e_name_kr',
      nullable: true,
      length: 50,
    })
    eNameKr: string | null;
  
    @Column('text', { name: 'e_desc_kr', nullable: true })
    eDescKr: string | null;
  
    @Column('character varying', {
      name: 'x_name_kr',
      nullable: true,
      length: 50,
    })
    xNameKr: string | null;
  
    @Column('text', { name: 'x_desc_kr', nullable: true })
    xDescKr: string | null;
  
    // skills (US)
    @Column('character varying', { name: 'passive_name_us', nullable: true, length: 50})
    passiveNameUs: string | null;
  
    @Column('text', { name: 'passive_desc_us', nullable: true })
    passiveDescUs: string | null;

    @Column('character varying', {
        name: 'z_name_us',
        nullable: true,
        length: 50,
      })
    zNameUs: string | null;
    
    @Column('text', { name: 'z_desc_us', nullable: true })
    zDescUs: string | null;
  
    @Column('character varying', {
      name: 'c_name_us',
      nullable: true,
      length: 50,
    })
    cNameUs: string | null;
  
    @Column('text', { name: 'c_desc_us', nullable: true })
    cDescUs: string | null;

    @Column('character varying', {
      name: 'e_name_us',
      nullable: true,
      length: 50,
    })
    eNameUs: string | null;

    @Column('text', { name: 'e_desc_us', nullable: true })
    eDescUs: string | null;
  
    @Column('character varying', {
      name: 'x_name_us',
      nullable: true,
      length: 50,
    })
    xNameUs: string | null;
  
    @Column('text', { name: 'x_desc_us', nullable: true })
    xDescUs: string | null;
}
  